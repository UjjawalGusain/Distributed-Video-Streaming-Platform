export const success = (status, data, message) => ({
    success: true,
    status,
    data,
    message,
});
export const failure = (status, message) => ({
    success: false,
    status,
    message,
});
