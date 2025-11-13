const NODE_SEVER_BASE_URL = "http://localhost:5000/api";

const APIS = {
    GET_FEED: `${NODE_SEVER_BASE_URL}/video-metadata/feed`,
    SUBMIT_VIDEO: `${NODE_SEVER_BASE_URL}/video/submit-video`,
    START_UPLOAD: `${NODE_SEVER_BASE_URL}/video/start-upload`,
    PART_UPLOAD: `${NODE_SEVER_BASE_URL}/video/part-upload`,
    COMPLETE_UPLOAD: `${NODE_SEVER_BASE_URL}/video/complete-upload`,
}

export default APIS;