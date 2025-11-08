const SERVER_BASE_URL = "http://localhost:5000/api";

const APIS = {
    GET_VIDEO: `${SERVER_BASE_URL}/video`,
    GET_VIDEO_METADATA: `${SERVER_BASE_URL}/video-metadata`,
    PUBLISH_VIDEO_FORMATS: `${SERVER_BASE_URL}/video/publish-formats`,
    MARK_VIDEO_PUBLISHED: `${SERVER_BASE_URL}/video-metadata/mark-metadata-publish`,
}

export default APIS;