const sendData = async (url, data) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        let resJSON;
        if (response.status != 404) resJSON = await response.json();
        if (response.status == 404) return {status: 'error', message: `Error: ${response.status} Not found`}
        else if (response.status == 500) return {status: 'error', message: `Error: ${response.status} Internal server error`}
        else if (response.status == 200 && resJSON.status != 'success') return {status: 'error', message: `Error: ${resJSON.status}`}
        else if (response.status == 200 && resJSON.status == 'success') return resJSON;
        else return {status: 'Error', message: `Error: ${response.status}`}
    } catch(err) {
        console.error(err);
    }
}

export default sendData;