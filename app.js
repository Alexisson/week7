
export default function appScr(express, bodyParser, fs, crypto, http, CORS, User, m) {
    const app = express();
    const headersHTML = {
        'Content-Type':'text/html; charset=utf-8',
        ...CORS}
    let headersTEXT = {
        'Content-Type':'text/plain',
        ...CORS
    }
    app
        
        .use(bodyParser.urlencoded({extended:true}))       
        .all('/login/', r => {
            r.res.set(headersTEXT).send('itmo307709');
        })
        .all('/code/', r => {
            r.res.set(headersTEXT)
            fs.readFile(import.meta.url.substring(7),(err, data) => {
                if (err) throw err;
                r.res.end(data);
              });           
        })
        .all('/sha1/:input/', r => {
            r.res.set(headersTEXT).send(crypto.createHash('sha1').update(r.params.input).digest('hex'))
        })
        .get('/req/', (req, res) =>{
            res.set(headersTEXT);
            let data = '';
            http.get(req.query.addr, async function(response) {
                await response.on('data',function (chunk){
                    data+=chunk;
                }).on('end',()=>{})
                res.send(data)
            })
        })
        .post('/req/', r =>{
            r.res.set(headersTEXT);
            const {addr} = req.body;
            r.res.send(addr)
        })
        .post('/insert/', async r=>{
            r.res.set(headersTEXT);
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
        .all('/render/',async r=>{
            r.res.set(headersHTML);
            let jsondata = r.body;
            console.log(jsondata)
            http.get(r.query.addr, async function(response) {
                let data = '';
                await response.on('data',function (chunk){
                    data+=chunk;
                }).on('end',()=>{})
                await fs.writeFile("./views/index.pug", data, function(error){
                    if(error) throw error;
                    r.res.render('index',{ 
                        login: 'itmo307709', 
                        random2: jsondata.random2,
                        random3: jsondata.random3
                    })
                })

            })
        })
        .use(({res:r})=>r.status(404).set(headersHTML).send('itmo307709'))
        .set('view engine','pug')
    return app;
}