const SERVER_BASE_URL = "http://api-server:5000/api";
const COMPLETION_HANDLER_BASE_URL = "http://completion-server:5002/api"

const APIS = {
    GET_VIDEO: `${SERVER_BASE_URL}/video`,
    GET_VIDEO_METADATA: `${SERVER_BASE_URL}/video-metadata`,
    SEND_TO_COMPLETION_QUEUE: `${COMPLETION_HANDLER_BASE_URL}/completion-handler/add-to-completion-queue`
}

export default APIS;
