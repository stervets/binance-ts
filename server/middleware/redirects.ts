export default defineEventHandler((event) => {
    const path = (event.path || '').split('/'),
        lastPathItem = path.pop();

    if (lastPathItem === 'script') {
        event.node.res.writeHead(301, {Location: '/' + path.join('/')});
        event.node.res.end();
    }
});
