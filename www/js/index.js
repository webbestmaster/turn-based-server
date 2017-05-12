/**
 * Created by dmitry.turovtsov on 12.05.2017.
 */

window.tb.ajax.post('/api/room/create-room').then(res => console.log(res));
window.tb.ajax.get('/api/room/get-rooms').then(res => console.log(res));

setTimeout(() => {

    window.tb.ajax.get('/api/room/join-room/1/privateUserId').then(res => console.log(res));


}, 1e3);
