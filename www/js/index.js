/**
 * Created by dmitry.turovtsov on 12.05.2017.
 */

window.tb.ajax.post('/api/room/create-room').then(res => console.log(res));
window.tb.ajax.get('/api/room/get-rooms').then(res => console.log(res));

setInterval(() => {
    window.tb.ajax.get('/api/room/get-room-state/1/some_key').then(res => console.log(res));
    window.tb.ajax.get('/api/room/get-room-state/1/some_key2').then(res => console.log(res));
}, 1e3);

setTimeout(() => {
    window.tb.ajax.post('/api/room/set-room-state/1', {some_key: 11}).then(res => console.log(res));
}, 1e3);

setTimeout(() => {
    window.tb.ajax.post('/api/room/set-room-state/1', {some_key2: {
        kk: {
            uu: {
                ll: 4
            }
        }
    }}).then(res => console.log(res));
}, 1e3);

setTimeout(() =>
        window.tb.ajax
            .get('/api/room/join-room/1/privateUserId')
            .then(res => console.log(res)),
    1e3);

setTimeout(() =>
        window.tb.ajax
            .get('/api/room/leave-room/1/privateUserId')
            .then(res => console.log(res)),
    2e3);
