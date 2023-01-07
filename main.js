import { Actor } from 'apify';
import axios from 'axios';

await Actor.init();

const input = await Actor.getInput();
let urls = [];

if (!input?.length && !input?.defaultDatasetId) {
    console.log(input);
    await Actor.exit();
} else if (input?.defaultDatasetId) {
    const dataset = await Actor.openDataset(input?.defaultDatasetId);
    const response = await dataset.getData();
    urls = response.items.map((item) => item.url);
} else {
    urls = input;
}

console.log('Provided urls', urls);

await Actor.setStatusMessage(`Processed 0/${urls.length} urls`);

function convertUrl(url) {
    return url.replace(/\//g, '_').replace(/#/g, '-hash-').replace(/\?/g, '-query-').replace(/:/g, '-part-');
}

async function downloadFile(url) {
    console.log('Downloading', url);
    const response = await axios.get(url);
    return response.data;
}

async function saveFile(url, data) {
    const fileName = convertUrl(url);
    await Actor.setValue(fileName, data);
    console.log('saved', fileName);
}

for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const data = await downloadFile(url);
    await saveFile(url, data);
    await Actor.setStatusMessage(`Processed ${i + 1}/${urls.length} urls`);
}

await Actor.exit();
