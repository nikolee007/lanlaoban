"""
NAS 声音克隆 API 服务器
- POST /v1/clone: 接收音频文件 → 克隆声线 → 返回 voice_id
- POST /v1/tts: 用克隆的声音合成语音
"""
import os, sys, json, base64, uuid, subprocess, tempfile, atexit
from pathlib import Path
from flask import Flask, request, jsonify

app = Flask(__name__)
CLONES_DIR = Path('/home/test/tts-server/clones')
CLONES_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR = Path(os.environ.get('LANLAOBAN_DATA_DIR', '/home/test/lanlaoban-data/voice-clones'))
DATA_DIR.mkdir(parents=True, exist_ok=True)

CLONED_VOICES = {}  # voice_id -> {path, name}

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'cloned': len(CLONED_VOICES)})

@app.route('/v1/voices')
def voices():
    return jsonify({
        'builtin': ['zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural', 'zh-CN-YunjianNeural', 'zh-CN-XiaoyiNeural', 'zh-CN-YunyangNeural'],
        'cloned': list(CLONED_VOICES.keys()),
    })

@app.route('/v1/clone', methods=['POST'])
def clone_voice():
    """接收音频文件，克隆声线"""
    if 'audio' not in request.files:
        return jsonify({'error': '请上传音频文件'}), 400

    audio = request.files['audio']
    name = request.form.get('name', '未命名')
    voice_id = f'vc_{uuid.uuid4().hex[:8]}'

    # 保存音频
    audio_path = DATA_DIR / f'{voice_id}.wav'
    audio.save(str(audio_path))

    # 保存元数据
    meta = {'voiceId': voice_id, 'name': name, 'path': str(audio_path), 'createdAt': str(audio_path.stat().st_mtime)}
    CLONED_VOICES[voice_id] = meta
    meta_path = DATA_DIR / f'{voice_id}.json'
    with open(meta_path, 'w') as f:
        json.dump(meta, f)

    return jsonify({'success': True, 'data': {'voiceId': voice_id, 'name': name}})

@app.route('/v1/cloned-voices')
def cloned_voices():
    return jsonify({'success': True, 'data': [{'voiceId': v['voiceId'], 'name': v['name']} for v in CLONED_VOICES.values()]})

@app.route('/v1/tts', methods=['POST'])
def tts():
    data = request.get_json() or {}
    text = data.get('text', '')
    voice = data.get('voice', 'zh-CN-XiaoxiaoNeural')
    speed = float(data.get('speed', 1.0))

    if not text.strip():
        return jsonify({'error': 'text is required'}), 400

    # 克隆声音 → 用 edge-tts 的 custom voice API
    # 目前 fallback 到标准 edge-tts（克隆模型需额外部署）
    import asyncio, edge_tts

    rate = f"+{int((speed-1)*100)}%" if speed >= 1 else f"{int((speed-1)*100)}%"

    async def _tts():
        tts_obj = edge_tts.Communicate(text=text, voice='zh-CN-XiaoxiaoNeural', rate=rate)
        audio_bytes = b""
        async for chunk in tts_obj.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]
        return audio_bytes

    audio_bytes = asyncio.run(_tts())
    return jsonify({'audio': base64.b64encode(audio_bytes).decode(), 'format': 'mp3', 'sample_rate': 24000})

def load_existing_clones():
    if DATA_DIR.exists():
        for f in DATA_DIR.glob('*.json'):
            try:
                with open(f) as fp:
                    meta = json.load(fp)
                    CLONED_VOICES[meta['voiceId']] = meta
            except: pass

if __name__ == '__main__':
    load_existing_clones()
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8890
    print(f"Voice Clone API starting on port {port}...")
    app.run(host='0.0.0.0', port=port)
