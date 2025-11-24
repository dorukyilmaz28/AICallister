# LiteLLM Setup Guide

LiteLLM, çoklu AI provider'larını destekleyen bir proxy/API gateway'dir. OpenRouter yerine LiteLLM kullanarak daha fazla esneklik ve kontrol elde edebilirsiniz.

## 🚀 LiteLLM Kurulumu

### Seçenek 1: Local LiteLLM Server (Development)

1. **LiteLLM'i yükleyin:**
```bash
pip install litellm
```

2. **LiteLLM'i başlatın:**
```bash
litellm --config config.yaml
```

veya basit kullanım:
```bash
litellm --model gpt-3.5-turbo --port 4000
```

3. **Config dosyası oluşturun** (`config.yaml`):
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY

  - model_name: claude-3-opus
    litellm_params:
      model: claude-3-opus
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: glm-4
    litellm_params:
      model: zhipuai/glm-4
      api_key: os.environ/ZHIPU_API_KEY

general_settings:
  master_key: your-master-key-here
```

### Seçenek 2: Cloud LiteLLM (Production)

1. **LiteLLM Cloud kullanın:**
   - [LiteLLM Cloud](https://docs.litellm.ai/docs/proxy/cloud) üzerinden instance oluşturun
   - Veya kendi sunucunuzda LiteLLM'i deploy edin

2. **Environment Variables:**
```env
LITELLM_API_URL="https://your-litellm-instance.com"
LITELLM_API_KEY="your-litellm-master-key"
LITELLM_MODEL="gpt-3.5-turbo"
```

## 🔧 Environment Variables

`.env` dosyanıza ekleyin:

```env
# LiteLLM Configuration
LITELLM_API_URL="http://localhost:4000"  # Local için
# LITELLM_API_URL="https://your-litellm-instance.com"  # Cloud için

LITELLM_API_KEY="your-api-key"  # LiteLLM master key veya provider API key
LITELLM_MODEL="gpt-3.5-turbo"  # Kullanmak istediğiniz model

# Provider API Keys (LiteLLM config'de kullanılacak)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
ZHIPU_API_KEY="..."  # GLM-4 için
```

## 📋 Desteklenen Modeller (100+ Model)

LiteLLM **100'den fazla model** destekler. İşte kategorilere göre liste:

### 🤖 OpenAI
- `gpt-3.5-turbo`, `gpt-3.5-turbo-16k`
- `gpt-4`, `gpt-4-turbo`, `gpt-4-turbo-preview`
- `gpt-4o`, `gpt-4o-mini`
- `gpt-4-32k`, `gpt-4-1106-preview`
- `o1-preview`, `o1-mini`

### 🧠 Anthropic (Claude)
- `claude-3-opus`, `claude-3-opus-20240229`
- `claude-3-sonnet`, `claude-3-sonnet-20240229`
- `claude-3-haiku`, `claude-3-haiku-20240307`
- `claude-3-5-sonnet-20241022`
- `claude-2`, `claude-2.1`

### 🌟 Google (Gemini)
- `gemini-pro`, `gemini-pro-vision`
- `gemini-1.5-pro`, `gemini-1.5-flash`
- `gemini-ultra`
- `gemini-2.0-flash-exp`

### 🇨🇳 ZhipuAI (GLM)
- `zhipuai/glm-4`
- `zhipuai/glm-4-all`
- `zhipuai/glm-3-turbo`
- `zhipuai/glm-4v`

### 🦙 Meta (Llama)
- `meta-llama/Llama-2-7b-chat-hf`
- `meta-llama/Llama-2-13b-chat-hf`
- `meta-llama/Llama-2-70b-chat-hf`
- `meta-llama/Llama-3-8b-instruct`
- `meta-llama/Llama-3-70b-instruct`

### 🚀 Mistral AI
- `mistral/mistral-tiny`
- `mistral/mistral-small`
- `mistral/mistral-medium`
- `mistral/mistral-large-latest`
- `mistralai/Mixtral-8x7B-Instruct-v0.1`

### 💬 Cohere
- `command`, `command-light`
- `command-nightly`, `command-light-nightly`
- `command-r`, `command-r-plus`

### 🎯 Together AI
- `togethercomputer/llama-2-7b-chat`
- `togethercomputer/llama-2-70b-chat`
- `mistralai/Mixtral-8x7B-Instruct-v0.1`
- `meta-llama/Llama-2-70b-chat-hf`

### 🔥 HuggingFace
- `huggingface/meta-llama/Llama-2-7b-chat-hf`
- `huggingface/mistralai/Mistral-7B-Instruct-v0.1`
- `huggingface/tiiuae/falcon-7b-instruct`
- `huggingface/google/flan-t5-xxl`
- Ve HuggingFace'teki binlerce model...

### 🧪 Replicate
- `replicate/meta/llama-2-70b-chat`
- `replicate/meta/llama-2-13b-chat`
- `replicate/a16z-infra/llama-2-7b-chat`

### 🌐 Groq
- `groq/llama-2-70b-4096`
- `groq/llama-2-7b-2048-token`
- `groq/mixtral-8x7b-32768`

### 🎨 Stability AI
- `stability-ai/stable-diffusion-xl-base-1.0`
- `stability-ai/stablelm-tuned-alpha-7b`

### 🦅 Falcon (TII)
- `tiiuae/falcon-7b-instruct`
- `tiiuae/falcon-40b-instruct`
- `tiiuae/falcon-180b-chat`

### 🐬 Dolphin
- `cognitivecomputations/dolphin-mixtral-8x7b`
- `cognitivecomputations/dolphin-2.6-mixtral-8x7b`

### 🔮 Perplexity
- `perplexity/llama-3-sonar-small-32k-online`
- `perplexity/llama-3-sonar-large-32k-online`

### 🎭 AI21 Labs
- `j2-ultra`, `j2-mid`, `j2-light`
- `jamba-1.5-large`

### 🌊 DeepInfra
- `deepinfra/meta-llama/Llama-2-70b-chat-hf`
- `deepinfra/meta-llama/Llama-2-13b-chat-hf`

### 🎪 OpenRouter (via LiteLLM)
- `openrouter/openai/gpt-3.5-turbo`
- `openrouter/anthropic/claude-3-opus`
- OpenRouter'daki tüm modeller...

### 🏠 Local Models (Ollama, vLLM, vb.)
- `ollama/llama2`
- `ollama/mistral`
- `ollama/codellama`
- `vllm/meta-llama/Llama-2-7b-chat-hf`

### 📊 Azure OpenAI
- `azure/gpt-3.5-turbo`
- `azure/gpt-4`
- `azure/gpt-4-turbo`

### ☁️ AWS Bedrock
- `bedrock/anthropic.claude-v2`
- `bedrock/amazon.titan-text-express-v1`
- `bedrock/ai21.j2-ultra-v1`

### 🎯 Diğer Provider'lar
- **Aleph Alpha**: `luminous-base`, `luminous-extended`
- **NVIDIA**: `nvidia/nemotron-70b`
- **Anyscale**: `anyscale/meta-llama/Llama-2-7b-chat-hf`
- **Cerebras**: `cerebras/llama-2-7b-chat-hf`
- **SambaNova**: `sambanova/llama-2-7b-chat-hf`
- **Vectara**: `vectara/summary`
- Ve daha fazlası...

> **Not**: Tam liste için [LiteLLM Providers Documentation](https://docs.litellm.ai/docs/providers) sayfasına bakın.

## 🎯 Model Seçimi

`LITELLM_MODEL` environment variable'ında kullanmak istediğiniz modeli belirtin:

```env
# OpenAI
LITELLM_MODEL="gpt-3.5-turbo"
LITELLM_MODEL="gpt-4"
LITELLM_MODEL="gpt-4o"
LITELLM_MODEL="o1-preview"

# Anthropic (Claude)
LITELLM_MODEL="claude-3-opus"
LITELLM_MODEL="claude-3-sonnet"
LITELLM_MODEL="claude-3-haiku"
LITELLM_MODEL="claude-3-5-sonnet-20241022"

# Google (Gemini)
LITELLM_MODEL="gemini-pro"
LITELLM_MODEL="gemini-1.5-pro"
LITELLM_MODEL="gemini-1.5-flash"

# ZhipuAI (GLM-4)
LITELLM_MODEL="zhipuai/glm-4"
LITELLM_MODEL="zhipuai/glm-4-all"

# Meta (Llama)
LITELLM_MODEL="meta-llama/Llama-2-70b-chat-hf"
LITELLM_MODEL="meta-llama/Llama-3-70b-instruct"

# Mistral
LITELLM_MODEL="mistral/mistral-large-latest"
LITELLM_MODEL="mistralai/Mixtral-8x7B-Instruct-v0.1"

# Cohere
LITELLM_MODEL="command"
LITELLM_MODEL="command-r-plus"

# Local (Ollama)
LITELLM_MODEL="ollama/llama2"
LITELLM_MODEL="ollama/mistral"
```

### 💡 Model Önerileri

**FRC AI Assistant için önerilen modeller:**

1. **En İyi Performans**: `claude-3-5-sonnet-20241022` veya `gpt-4o`
2. **Dengeli**: `gpt-3.5-turbo` veya `claude-3-sonnet`
3. **Hızlı**: `claude-3-haiku` veya `gemini-1.5-flash`
4. **Ücretsiz/Open Source**: `zhipuai/glm-4` veya `ollama/llama2`
5. **Türkçe İçin**: `gpt-4o` veya `claude-3-5-sonnet` (en iyi Türkçe desteği)

## 🔄 OpenRouter'dan Geçiş

1. **LiteLLM'i kurun ve başlatın**
2. **Environment variables'ı güncelleyin:**
   - `OPENROUTER_API_KEY` → `LITELLM_API_KEY`
   - `LITELLM_API_URL` ekleyin
   - `LITELLM_MODEL` ekleyin
3. **Provider API key'lerini ekleyin** (OpenAI, Anthropic, vb.)
4. **Test edin**

## 💡 Avantajlar

- ✅ Çoklu provider desteği
- ✅ Fallback mekanizması (bir model çalışmazsa diğerine geçer)
- ✅ Rate limiting ve caching
- ✅ Cost tracking
- ✅ Local deployment seçeneği
- ✅ Daha fazla kontrol

## 📚 Daha Fazla Bilgi

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [LiteLLM GitHub](https://github.com/BerriAI/litellm)
- [Supported Models](https://docs.litellm.ai/docs/providers)

