document.getElementById('s3Form').addEventListener('submit', async(e) => {
    e.preventDefault();

    const endpoint = document.getElementById('endpoint').value;
    const accessKey = document.getElementById('accessKey').value;
    const secretKey = document.getElementById('secretKey').value;
    const region = document.getElementById('region').value;
    const bucket = document.getElementById('bucket').value;
    const fileUpload = document.getElementById('fileUpload').files[0];

    const formData = new FormData();
    formData.append('endpoint', endpoint);
    formData.append('accessKey', accessKey);
    formData.append('secretKey', secretKey);
    formData.append('region', region);
    formData.append('bucket', bucket);
    formData.append('file', fileUpload);

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = "Đang chạy test...";

    try {
        const response = await fetch('http://localhost:3000/test', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            resultsDiv.innerHTML = `
                <p>Tốc độ upload: ${data.uploadSpeed}</p>
                <p>Tốc độ download: ${data.downloadSpeed}</p>
            `;
        } else {
            const errorText = await response.text();
            resultsDiv.innerHTML = `Có lỗi xảy ra: ${errorText}`;
        }
    } catch (err) {
        resultsDiv.innerHTML = `Lỗi kết nối đến server: ${err.message}`;
    }
});