
export default function appScr(express, bodyParser, fs, crypto, http, CORS, User, m) {
    const app = express();
    const hu = {'Content-Type':'text/html; charset=utf-8'}
    let headers = {
        'Content-Type':'text/plain',
        ...CORS
    }
    app
        .use(bodyParser.urlencoded({extended:true}))       
        .all('/login/', r => {
            r.res.set(headers).send('itmo307709');
        })
        .all('/code/', r => {
            r.res.set(headers)
            fs.readFile(import.meta.url.substring(7),(err, data) => {
                if (err) throw err;
                r.res.end(data);
              });           
        })
        .all('/sha1/:input/', r => {
            r.res.set(headers).send(crypto.createHash('sha1').update(r.params.input).digest('hex'))
        })
        .get('/req/', (req, res) =>{
            res.set(headers);
            let data = '';
            http.get(req.query.addr, async function(response) {
                await response.on('data',function (chunk){
                    data+=chunk;
                }).on('end',()=>{})
                res.send(data)
            })
        })
        .post('/req/', r =>{
            r.res.set(headers);
            const {addr} = req.body;
            r.res.send(addr)
        })
        .post('/insert/', async r=>{
            r.res.set(headers);
            const {login,password,URL}=r.body;
            const newUser = new User({login,password});
            try{
                await m.connect(URL, {useNewUrlParser:true, useUnifiedTopology:true});
                try{
                    await newUser.save();
                    r.res.status(201).json({'Добавлено: ':login});
                }
                catch(e){
                    r.res.status(400).json({'Ошибка: ':'Нет пароля'});
                }
            }
            catch(e){
                console.log(e.codeName);
            }      
        })
        .post('/wordpress/', r=>{
            
        })
        .post('/render/',r=>{
            r.res.set(headers);
            const {random2, random3} = req.body;
            http.get(r.query.addr, async function(response) {
                await response.on('data',function (chunk){
                    data+=chunk;
                }).on('end',()=>{})
                // data = data.replace('random2',random2)
                // data = data.replace('random3',random3)
                fs.writeFile("./views/render.pug", data, function(error){
                    if(error) throw error;
                })
                r.res.render('render')
            })
        })
        .use(({res:r})=>r.status(404).set(hu).send('itmo307709'))
        .set('view engine','pug')
    return app;
}