use image::ImageEncoder;
use wasm_bindgen::prelude::*;
use web_sys::js_sys;

#[wasm_bindgen]
pub fn init() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub async fn convert_image(input: web_sys::File) -> Result<web_sys::File, JsValue> {
    // FileをArrayBufferに変換
    let array_buffer = wasm_bindgen_futures::JsFuture::from(input.array_buffer()).await?;
    let uint8_array = js_sys::Uint8Array::new(&array_buffer);
    let input_bytes = uint8_array.to_vec();

    // 入力画像をデコード
    let img =
        image::load_from_memory(&input_bytes).map_err(|e| JsValue::from_str(&e.to_string()))?;

    // WebPにエンコード
    let mut output = Vec::new();
    let encoder = image::codecs::webp::WebPEncoder::new_lossless(&mut output);
    encoder
        .write_image(
            &img.to_rgba8(),
            img.width(),
            img.height(),
            image::ExtendedColorType::Rgba8,
        )
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // 新しいFileオブジェクトを作成
    let uint8_array = js_sys::Uint8Array::from(&output[..]);
    let blob = web_sys::Blob::new_with_u8_array_sequence(&js_sys::Array::of1(&uint8_array))?;
    let file = web_sys::File::new_with_buffer_source_sequence(
        &js_sys::Array::of1(&blob),
        "converted.webp",
    )?;

    Ok(file)
}
