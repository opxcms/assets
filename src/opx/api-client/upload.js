import client from "./api-client";

const Upload = async function (url, original, file, options) {
    return new Promise((resolve, reject) => {
        const size = 10000000;

        const chunksTotal = file.length / size + .5 | 0;
        let chunksProcessed = 0;

        let chunks = new Array(chunksTotal);

        for (var i = 0, o = 0; i < chunksTotal; ++i, o += size) {
            chunks[i] = file.substr(o, size);
        }

        let filename;

        function sendPart() {
            client.post(url, {
                filename: filename,
                original: original,
                part: chunksProcessed,
                content: btoa(chunks[chunksProcessed])
            }, {
                onUploadProgress: e => {
                    if (typeof options.progress !== "undefined") {
                        let currentProcess;
                        if (e.lengthComputable) {
                            currentProcess = e.loaded / e.total * 100;
                        } else {
                            currentProcess = (e.loaded % 1000000) / 10000;
                        }
                        let scaleSteps = 100 / chunksTotal;
                        let process = Math.floor(chunksProcessed * scaleSteps + currentProcess * scaleSteps / 100);

                        options.progress(process);
                    }
                }
            })
                .then(response => {
                        chunksProcessed++;
                        filename = response.data['filename'];
                        if (chunksProcessed === chunksTotal) {
                            resolve(response.data);
                        } else {
                            sendPart();
                        }
                    }
                )
                .catch(error => {
                    reject(error);
                })
        };

        sendPart();
    });

}

export default Upload;