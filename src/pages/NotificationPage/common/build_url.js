    export const buildUrl = (page) => {
        const url = 'api/v1/notifications/'
        const params = new URLSearchParams()

        if (page) params.set('page', page);
        const queryParams = params.toString()

        return queryParams ? `${url}?${queryParams}` : url
    }