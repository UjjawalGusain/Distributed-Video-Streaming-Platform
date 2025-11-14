const NODE_SEVER_BASE_URL = "http://localhost:5000/api";

const APIS = {
    GET_FEED: `${NODE_SEVER_BASE_URL}/video-metadata/feed`,
    SUBMIT_VIDEO: `${NODE_SEVER_BASE_URL}/video/submit-video`,
    START_UPLOAD: `${NODE_SEVER_BASE_URL}/video/start-upload`,
    PART_UPLOAD: `${NODE_SEVER_BASE_URL}/video/part-upload`,
    COMPLETE_UPLOAD: `${NODE_SEVER_BASE_URL}/video/complete-upload`,
    GET_VIDEO: `${NODE_SEVER_BASE_URL}/video`, // /:videoId
    GET_VIDEO_METADATA: `${NODE_SEVER_BASE_URL}/video-metadata`, // /:videoId
    POST_REACTION: `${NODE_SEVER_BASE_URL}/reaction/`,
    COUNT_REACTION: `${NODE_SEVER_BASE_URL}/reaction/count`,
    USER_REACTION: `${NODE_SEVER_BASE_URL}/reaction/user`,
}

export default APIS;