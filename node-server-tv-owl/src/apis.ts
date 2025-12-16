const TRANSCODER_BASE_URL = "http://transcoding-server:5001/api";

const APIS = {
    PRETRANSCODER_QUEUE_SEND: `${TRANSCODER_BASE_URL}/transcoder/add-to-queue`,
}

export default APIS;
