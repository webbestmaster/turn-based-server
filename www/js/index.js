/**
 * Created by dmitry.turovtsov on 12.05.2017.
 */

window.tb.ajax.post('/api/room/create-room').then(res => console.log(res));
window.tb.ajax.get('/api/room/get-rooms').then(res => console.log(res));
