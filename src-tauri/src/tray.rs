//! Tray glyph, drawn at runtime instead of shipping a bitmap.
//!
//! The window icon is a 512px square with a 40px stroke and a terracotta dot.
//! Squeezed into a 16px tray slot the stroke collapses to ~1.25px and the dot
//! turns into dirt, so the tray gets its own mark: same key, no plate, no dot,
//! a stroke thick enough to survive 16px.
//!
//! The glyph is rasterised here with a signed distance field and 4x4
//! supersampling. That keeps it sharp at any DPI and avoids adding an image
//! decoding dependency for one 32px icon.

use tauri::image::Image;

const DESIGN: f32 = 32.0;

/// Design-space geometry. All lengths are in the 32-unit box.
const HEAD_CX: f32 = 10.4;
const HEAD_CY: f32 = 10.4;
const HEAD_R: f32 = 6.3;
const STROKE: f32 = 4.6;
const SHAFT_END: f32 = 25.4;
/// cos(45 graus) — o corpo da chave desce para a direita, como no ícone da janela.
const DIAG: f32 = 0.707_106_78;
const TOOTH_AT: [f32; 2] = [0.55, 0.92];
const TOOTH_LEN: [f32; 2] = [5.0, 3.8];

/// Tinta escura: o desenho some sobre barra de tarefas clara se ficar claro.
const INK: [u8; 3] = [0x1e, 0x20, 0x1d];
/// Creme da paleta do app, para a barra de tarefas escura.
const CREAM: [u8; 3] = [0xf4, 0xf1, 0xea];

fn sd_circle(px: f32, py: f32, cx: f32, cy: f32, r: f32) -> f32 {
    ((px - cx).powi(2) + (py - cy).powi(2)).sqrt() - r
}

fn sd_segment(px: f32, py: f32, a: [f32; 2], b: [f32; 2]) -> f32 {
    let (pax, pay) = (px - a[0], py - a[1]);
    let (bax, bay) = (b[0] - a[0], b[1] - a[1]);
    let denom = bax * bax + bay * bay;
    let h = if denom == 0.0 {
        0.0
    } else {
        ((pax * bax + pay * bay) / denom).clamp(0.0, 1.0)
    };
    ((pax - bax * h).powi(2) + (pay - bay * h).powi(2)).sqrt()
}

/// Distância com sinal até o contorno da chave, em unidades de projeto.
/// Negativo dentro, positivo fora.
fn silhouette(x: f32, y: f32) -> f32 {
    let half = STROKE / 2.0;

    // Anel: distância até o círculo do meio, menos metade do traço.
    let mut d = sd_circle(x, y, HEAD_CX, HEAD_CY, HEAD_R).abs() - half;

    // Corpo, começando onde o anel termina para a junção não abrir.
    let a = [HEAD_CX + HEAD_R * DIAG, HEAD_CY + HEAD_R * DIAG];
    let b = [SHAFT_END, SHAFT_END];
    d = d.min(sd_segment(x, y, a, b) - half);

    // Dentes, apontando de volta para a cabeça para lerem como entalhes.
    for (at, len) in TOOTH_AT.iter().zip(TOOTH_LEN.iter()) {
        let tip = [a[0] + (b[0] - a[0]) * at, a[1] + (b[1] - a[1]) * at];
        let end = [tip[0] - DIAG * len, tip[1] + DIAG * len];
        d = d.min(sd_segment(x, y, tip, end) - half);
    }

    d
}

/// Rasteriza o glifo em `size` px com `color`, em alfa reto.
fn render(size: u32, color: [u8; 3]) -> Image<'static> {
    const SS: u32 = 4; // amostras por eixo
    let scale = size as f32 / DESIGN;
    let mut rgba = Vec::with_capacity((size * size * 4) as usize);

    for py in 0..size {
        for px in 0..size {
            let mut coverage = 0.0f32;
            for sy in 0..SS {
                for sx in 0..SS {
                    let x = (px as f32 + (sx as f32 + 0.5) / SS as f32) / scale;
                    let y = (py as f32 + (sy as f32 + 0.5) / SS as f32) / scale;
                    coverage += (0.5 - silhouette(x, y)).clamp(0.0, 1.0);
                }
            }
            let alpha = (255.0 * coverage / (SS * SS) as f32).round() as u8;
            rgba.extend_from_slice(&[color[0], color[1], color[2], alpha]);
        }
    }

    Image::new_owned(rgba, size, size)
}

/// A barra de tarefas clara pede glifo escuro; a escura pede claro.
/// A cor não é configurável no app, então lemos a preferência do Windows.
#[cfg(target_os = "windows")]
fn taskbar_is_light() -> bool {
    use windows::core::w;
    use windows::Win32::System::Registry::{RegGetValueW, HKEY_CURRENT_USER, RRF_RT_REG_DWORD};

    let mut value: u32 = 1;
    let mut size = std::mem::size_of::<u32>() as u32;
    let status = unsafe {
        RegGetValueW(
            HKEY_CURRENT_USER,
            w!("Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize"),
            w!("SystemUsesLightTheme"),
            RRF_RT_REG_DWORD,
            None,
            Some(&mut value as *mut u32 as *mut _),
            Some(&mut size),
        )
    };
    // O Windows 11 entrega barra escura por padrão; essa é a suposição segura.
    status.is_ok() && value == 1
}

#[cfg(not(target_os = "windows"))]
fn taskbar_is_light() -> bool {
    false
}

/// Cor do glifo que contrasta com a barra atual. No macOS o ícone é um
/// template: o sistema descarta a cor e usa só o alfa, então o preto é o certo.
fn glyph_color() -> [u8; 3] {
    if cfg!(target_os = "macos") || taskbar_is_light() {
        INK
    } else {
        CREAM
    }
}

/// Imagem da bandeja. O Windows pede 16px a 100% e escala pelo DPI, então
/// rasterizar em 32 mantém nítido em 150% e 200%.
pub fn icon() -> Image<'static> {
    render(32, glyph_color())
}

/// Relê o tema da barra e repinta a bandeja. Barato o bastante para chamar
/// quando a janela aparece, o que cobre a troca de tema sem vigiar o registro.
pub fn refresh(app: &tauri::AppHandle) {
    if let Some(tray) = app.tray_by_id("main") {
        let _ = tray.set_icon(Some(icon()));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn alpha_at(img: &Image<'_>, x: u32, y: u32) -> u8 {
        img.rgba()[((y * img.width() + x) * 4 + 3) as usize]
    }

    #[test]
    fn tem_o_tamanho_pedido() {
        let img = render(32, INK);
        assert_eq!(img.width(), 32);
        assert_eq!(img.height(), 32);
        assert_eq!(img.rgba().len(), 32 * 32 * 4);
    }

    #[test]
    fn desenha_a_cabeca_e_o_corpo() {
        let img = render(32, INK);
        // Anel da cabeça: o traço passa no topo do círculo.
        assert!(alpha_at(&img, 10, 5) > 200, "topo do anel deve estar opaco");
        // Centro do anel: o furo é vazado.
        assert!(alpha_at(&img, 10, 10) < 20, "o furo do anel deve ser vazado");
        // Corpo da chave, no fim da haste.
        assert!(alpha_at(&img, 24, 24) > 200, "a haste deve chegar ao canto");
        // Canto oposto: nada desenhado.
        assert!(alpha_at(&img, 1, 30) < 20, "o canto inferior esquerdo é vazio");
    }

    #[test]
    fn usa_a_cor_pedida() {
        let img = render(32, CREAM);
        let px = img.rgba();
        let idx = ((24 * 32 + 24) * 4) as usize;
        assert_eq!(&px[idx..idx + 3], &CREAM);
    }

    #[test]
    fn sobrevive_em_16px() {
        // Em 16px o glifo ainda precisa ter massa: nada de sumir.
        let img = render(16, INK);
        let opacos = img.rgba().chunks(4).filter(|p| p[3] > 128).count();
        assert!(opacos > 40, "o glifo ficou vazio em 16px: {opacos} px");
        assert!(opacos < 150, "o glifo ficou uma mancha em 16px: {opacos} px");
    }
}

