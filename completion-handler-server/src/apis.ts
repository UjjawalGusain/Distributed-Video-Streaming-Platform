const SERVER_BASE_URL = "http://localhost:5000/api";

const APIS = {
    PUBLISH_VIDEO_FORMATS: `${SERVER_BASE_URL}/video/publish-formats`,
    MARK_VIDEO_PUBLISHED: `${SERVER_BASE_URL}/video-metadata/mark-metadata-publish`,
    CREATE_NOTIFICATION: `${SERVER_BASE_URL}/notification`,
}

export default APIS;
