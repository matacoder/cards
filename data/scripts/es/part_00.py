import json
D = """de del;de;prep;из, от, о;of, from
que;que;conj;что, который;that, which
no;no;adv;нет, не;no, not
a al;a;prep;к, в;to, at
la el los las;el;det;определённый артикль;the
y e;y;conj;и;and
es siendo son soy eres sea sido será seas eran fueron sería fuiste eras somos fue era ser fui;ser;verb;быть;to be
en;en;prep;в, на;in, on
lo;lo;pron;его, это;it, him
un una unos unas;un;det;один, некоторые;a, an, some
por;por;prep;за, по, из-за;for, by
qué;qué;pron;что, какой;what
me;me;pron;меня, мне;me
te;te;pron;тебя, тебе;you
se;se;pron;себя, -ся;oneself, himself
nos;nos;pron;нас, нам;us
os;os;pron;вас, вам;you (pl.)
le;le;pron;ему, ей;him, her
les;les;pron;им;them
con;con;prep;с;with
para;para;prep;для, чтобы;for, in order to
está estoy estás estaba estamos están estar estado estabas estaban estuvo estará esté estaré estaría estuve estábamos;estar;verb;быть, находиться;to be
mi mis;mi;det;мой;my
tu tus;tu;det;твой;your
su sus;su;det;его, её, их, ваш;his, her, their, your
mío mía;mío;adj;мой;mine
tuyo;tuyo;adj;твой;yours
nuestro nuestra nuestros nuestras;nuestro;det;наш;our
pero mas_;pero;conj;но;but
sí;sí;adv;да;yes
si;si;conj;если, ли;if, whether
bien;bien;adv;хорошо;well, good
eso;eso;pron;это, то;that
esto;esto;pron;это;this
ese esa esos esas;ese;det;тот;that
este esta estos estas éste ésta;este;det;этот;this
yo;yo;pron;я;I
tú;tú;pron;ты;you
él;él;pron;он;he
ella;ella;pron;она;she
ellos ellas;ellos;pron;они;they
nosotros;nosotros;pron;мы;we
vosotros;vosotros;pron;вы;you (pl.)
usted ustedes;usted;pron;вы;you (formal)
mí;mí;pron;мне, меня;me
ti;ti;pron;тебе, тебя;you
conmigo;conmigo;pron;со мной;with me
contigo;contigo;pron;с тобой;with you
como cómo;como;adv;как;as, how
aquí;aquí;adv;здесь;here
más;más;adv;больше, более;more
todo toda todos todas;todo;det;весь, всё;all, everything
ya;ya;adv;уже;already
ahora;ahora;adv;сейчас;now
muy;muy;adv;очень;very
ha he has hemos han haber había haya habría habrá hubiera hay;haber;verb;иметь (вспомогательный), быть;to have (auxiliary), there is
así;así;adv;так, таким образом;like this, so
vamos voy vas va ir van iba ido iré vete irme;ir;verb;идти, ехать;to go
algo;algo;pron;что-то;something
bueno buena buen buenas buenos;bueno;adj;хороший;good
tengo tiene tienes tenemos tener tenía tienen tuve tuvo tenga tenido tenías;tener;verb;иметь;to have
cuando cuándo;cuando;adv;когда;when
puedo puede puedes podría podemos pueden poder pueda podía podrías podríamos;poder;verb;мочь;can, to be able
quiero quiere quieres queremos quería quieren quieras quiera querer;querer;verb;хотеть, любить;to want, to love
hacer hizo haces hecho hace haciendo hacerlo haré hice hiciste haga hacen hagas hacemos haría hará haz hago;hacer;verb;делать;to do, to make
gracias;gracias;interj;спасибо;thanks
vez veces;vez;noun:la;раз;time, occasion
sólo solo sola;solo;adv;только, один;only, alone
porque;porque;conj;потому что;because
creo crees cree creer creí;creer;verb;верить, думать;to believe, to think
sé sabes sabe sabía saber sabemos saben;saber;verb;знать;to know
verdad;verdad;noun:la;правда;truth
casa;casa;noun:la;дом;house
tan;tan;adv;так, такой;so
quién quien;quién;pron;кто;who
tiempo;tiempo;noun:el;время, погода;time, weather
dos;dos;num;два;two
nunca;nunca;adv;никогда;never
dónde donde;dónde;adv;где;where
favor;favor;noun:el;услуга, одолжение;favor
mucho mucha muchas muchos;mucho;det;много;much, many
señor;señor;noun:el;господин, сеньор;sir, mister
señora;señora;noun:la;госпожа, сеньора;madam, lady
señorita;señorita;noun:la;барышня, мисс;miss
mejor mejores;mejor;adj;лучший, лучше;better, best
decir dijo dice digo dicen dicho dijiste dije diciendo dime diga digas di diré decirle decirte dices dile;decir;verb;говорить, сказать;to say, to tell
también;también;adv;также, тоже;also, too
sobre;sobre;prep;о, над, на;about, on, over
dios;dios;noun:el;бог;god
sin;sin;prep;без;without
siento siente sientes sentir;sentir;verb;чувствовать, сожалеть;to feel, to regret
ver veo ves vemos visto vi vio viste verte verlo ve;ver;verb;видеть, смотреть;to see, to watch
hombre hombres;hombre;noun:el;мужчина, человек;man
vida;vida;noun:la;жизнь;life
alguien;alguien;pron;кто-то;someone
cosa cosas;cosa;noun:la;вещь, дело;thing
siempre;siempre;adv;всегда;always
hasta;hasta;prep;до, даже;until, even
ahí;ahí;adv;там;there
allí allá;allí;adv;там;there
ni;ni;conj;ни, даже не;nor, not even
año años;año;noun:el;год;year
antes;antes;adv;раньше, до;before
poco;poco;adv;мало, немного;little, few
día días;día;noun:el;день;day
uno;uno;num;один;one
noche noches;noche;noun:la;ночь, вечер;night
otro otra otros otras;otro;det;другой;other, another
acuerdo;acuerdo;noun:el;согласие, соглашение;agreement
trabajo;trabajo;noun:el;работа;work, job
trabajar trabajando;trabajar;verb;работать;to work
parece;parecer;verb;казаться, походить;to seem
gente;gente;noun:la;люди;people
mira mire;mirar;verb;смотреть;to look
mismo misma;mismo;adj;тот же, сам;same, itself
nadie;nadie;pron;никто;nobody
padre padres;padre;noun:el;отец;father
madre;madre;noun:la;мать;mother
hablar habla hablando hablas;hablar;verb;говорить;to speak, to talk
tal;tal;adj;такой;such
pasa pasó pasar pasando pase;pasar;verb;происходить, проходить, передавать;to happen, to pass
paso;paso;noun:el;шаг;step
fuera;fuera;adv;снаружи, вне;outside
después;después;adv;потом, после;after, later
desde;desde;prep;с, от;since, from
dinero;dinero;noun:el;деньги;money
mundo;mundo;noun:el;мир;world
claro;claro;adj;ясный, понятный;clear, of course
momento;momento;noun:el;момент;moment
tipo;tipo;noun:el;тип, парень;type, guy
mañana;mañana;noun:la;утро, завтра;morning, tomorrow
lugar;lugar;noun:el;место;place
vale;vale;interj;ладно, хорошо;okay
seguro segura;seguro;adj;уверенный, надёжный;sure, safe
espera esperar espero esperando;esperar;verb;ждать, надеяться;to wait, to hope
nuevo nueva;nuevo;adj;новый;new
hijo hija hijos;hijo;noun:el;сын, ребёнок;son, child
amigo amiga amigos;amigo;noun:el;друг;friend
menos;menos;adv;меньше, минус;less, minus
grande gran grandes;grande;adj;большой, великий;big, great
mujer mujeres;mujer;noun:la;женщина, жена;woman, wife
mamá;mamá;noun:la;мама;mom
papá;papá;noun:el;папа;dad
luego;luego;adv;потом, затем;later, then
hoy;hoy;adv;сегодня;today
tres;tres;num;три;three
necesito necesita necesitamos necesitas;necesitar;verb;нуждаться, нужно;to need
oye;oye;interj;эй, слушай;hey, listen
gusta gustaría;gustar;verb;нравиться;to like
encanta;encantar;verb;очень нравиться, очаровывать;to love, to delight
parte;parte;noun:la;часть;part
nombre;nombre;noun:el;имя, название;name
mierda;mierda;noun:la;дерьмо;shit
mal malo mala;malo;adj;плохой;bad
debe debo debes deberías debería deben debemos deberíamos;deber;verb;быть должным, долг;must, to owe
realmente;realmente;adv;действительно;really
aún todavía;todavía;adv;ещё, всё ещё;still, yet
importa;importar;verb;быть важным, иметь значение;to matter
razón;razón;noun:la;причина, правота;reason, right
alguna algún algunos algunas;alguno;det;какой-нибудь, некоторый;some, any
tanto;tanto;adv;так много;so much
serio;serio;adj;серьёзный;serious
idea;idea;noun:la;идея;idea
tarde;tarde;noun:la;вечер, поздно;afternoon, late
problema problemas;problema;noun:el;проблема;problem
hora horas;hora;noun:la;час, время;hour, time
cierto;cierto;adj;верный, определённый;true, certain
demasiado;demasiado;adv;слишком;too much
amor;amor;noun:el;любовь;love
entre;entre;prep;между;between, among
pasado;pasado;adj;прошлый;past, last
familia;familia;noun:la;семья;family
policía;policía;noun:la;полиция;police
chica chicas;chica;noun:la;девушка;girl
chico chicos;chico;noun:el;парень, мальчик;boy, guy
cuenta;cuenta;noun:la;счёт;bill, account
salir;salir;verb;выходить, уходить;to leave, to go out
vaya;vaya;interj;ну и ну, ого;wow, well
amo;amar;verb;любить;to love
pensé pensar pienso piensa piensas pensando pensaba;pensar;verb;думать;to think
cabeza;cabeza;noun:la;голова;head
cariño;cariño;noun:el;дорогой, ласка;darling, affection
forma;forma;noun:la;форма, способ;form, way
mientras;mientras;conj;пока;while
lado;lado;noun:el;сторона;side
caso;caso;noun:el;случай, дело;case
primera primero primer;primero;adj;первый;first
genial;genial;adj;классный, гениальный;great, brilliant
supuesto;supuesto;noun:el;предположение;assumption
hermano;hermano;noun:el;брат;brother
hermana;hermana;noun:la;сестра;sister
pues;pues;conj;ну, так как;well, since
adiós;adiós;interj;до свидания;goodbye
persona personas;persona;noun:la;человек, персона;person
volver vuelve vuelto;volver;verb;возвращаться;to return
vuelta;vuelta;noun:la;возвращение, круг;return, turn
quizá quizás;quizá;adv;может быть;maybe
contra;contra;prep;против;against
camino;camino;noun:el;дорога, путь;road, way
durante;durante;prep;во время;during
manera;manera;noun:la;способ, манера;way, manner
muerto;muerto;adj;мёртвый;dead
rápido;rápido;adj;быстрый;fast
cuál cual;cuál;pron;который, какой;which
ayuda;ayuda;noun:la;помощь;help
ayudar;ayudar;verb;помогать;to help
historia;historia;noun:la;история;story, history
supongo supone;suponer;verb;предполагать;to suppose
entiendo entiendes;entender;verb;понимать;to understand
dentro;dentro;adv;внутри;inside
casi;casi;adv;почти;almost
puerta;puerta;noun:la;дверь;door
significa;significar;verb;значить;to mean
semana semanas;semana;noun:la;неделя;week
hacia;hacia;prep;к, в сторону;toward
juntos;junto;adj;вместе, совместный;together
niño niños niña;niño;noun:el;ребёнок, мальчик;child, boy
pronto;pronto;adv;скоро;soon
tío;tío;noun:el;дядя, парень;uncle, guy
suerte;suerte;noun:la;удача;luck
ciudad;ciudad;noun:la;город;city
siquiera;siquiera;adv;хотя бы;even
feliz;feliz;adj;счастливый;happy
venir viene venga venido vino ven;venir;verb;приходить;to come
minutos minuto;minuto;noun:el;минута;minute
cuánto cuanto;cuánto;adv;сколько;how much
hey;hey;interj;эй;hey
muerte;muerte;noun:la;смерть;death
dejar deja dejó déjame;dejar;verb;оставлять, позволять;to leave, to let
realidad;realidad;noun:la;реальность;reality
importante;importante;adj;важный;important
corazón;corazón;noun:el;сердце;heart
miedo;miedo;noun:el;страх;fear
jefe;jefe;noun:el;начальник, босс;boss, chief
agua;agua;noun:el;вода;water
justo;justo;adj;справедливый, точно;fair, just
esposa;esposa;noun:la;жена;wife
mano manos;mano;noun:la;рука;hand
ojos;ojo;noun:el;глаз;eye
adelante;adelante;adv;вперёд;forward
encontrar encontrado encontré;encontrar;verb;находить;to find
cinco;cinco;num;пять;five
ninguna ningún;ninguno;det;никакой, ни один;no, none
cara;cara;noun:la;лицо;face
cuidado;cuidado;noun:el;осторожность, забота;care, caution
bajo;bajo;prep;под;under
cerca;cerca;adv;близко;near
viejo;viejo;adj;старый;old
bastante;bastante;adv;довольно, достаточно;quite, enough
fin;fin;noun:el;конец;end
tomar toma;tomar;verb;брать, пить;to take, to drink
único única;único;adj;единственный;only, unique
escucha;escuchar;verb;слушать;to listen
suficiente;suficiente;adj;достаточный;enough
punto;punto;noun:el;точка, пункт;point
sigue seguir;seguir;verb;следовать, продолжать;to follow, to continue
equipo;equipo;noun:el;команда, оборудование;team, equipment
llegar llegado llegó;llegar;verb;прибывать, приходить;to arrive
incluso;incluso;adv;даже;even
doctor;doctor;noun:el;доктор;doctor
difícil;difícil;adj;трудный;difficult
aunque;aunque;conj;хотя;although
coche;coche;noun:el;машина;car
clase;clase;noun:la;класс, урок;class, lesson
cuatro;cuatro;num;четыре;four
pequeño pequeña;pequeño;adj;маленький;small
llama llamar llamado llamo;llamar;verb;звать, звонить;to call
llamada;llamada;noun:la;звонок;call
arriba;arriba;adv;наверху;up, above
tierra;tierra;noun:la;земля;earth, land
guerra;guerra;noun:la;война;war
igual;igual;adj;равный, одинаковый;equal, same
loco loca;loco;adj;сумасшедший;crazy
sangre;sangre;noun:la;кровь;blood
juego;juego;noun:el;игра;game
jugar;jugar;verb;играть;to play
cuerpo;cuerpo;noun:el;тело;body
entrar;entrar;verb;входить;to enter
oportunidad;oportunidad;noun:la;возможность, шанс;opportunity, chance
teléfono;teléfono;noun:el;телефон;phone
final;final;noun:el;конец, финал;end, final
listo lista;listo;adj;готовый, умный;ready, smart
fiesta;fiesta;noun:la;вечеринка, праздник;party
auto;auto;noun:el;авто, машина;car
dar da dio dado darle dame;dar;verb;давать;to give
vivir;vivir;verb;жить;to live
vivo;vivo;adj;живой;alive
posible;posible;adj;возможный;possible
ok;ok;interj;ладно, окей;okay
número;número;noun:el;число, номер;number
meses;mes;noun:el;месяц;month
exactamente;exactamente;adv;точно;exactly
culpa;culpa;noun:la;вина;fault, guilt
abajo;abajo;adv;внизу;below, down
escuela;escuela;noun:la;школа;school
fuerte;fuerte;adj;сильный;strong
pregunta preguntas;pregunta;noun:la;вопрос;question
ello;ello;pron;это;it
atrás;atrás;adv;сзади, назад;behind, back
capitán;capitán;noun:el;капитан;captain
bebé;bebé;noun:el;малыш, ребёнок;baby
segundo;segundo;adj;второй;second
mayor;mayor;adj;старший, больший;older, greater
comida;comida;noun:la;еда;food
morir murió;morir;verb;умирать;to die
conozco conoces conoce;conocer;verb;знать, быть знакомым;to know, to meet
fácil;fácil;adj;лёгкий;easy
comer;comer;verb;есть, кушать;to eat
par;par;noun:el;пара;pair
trata tratando;tratar;verb;пытаться, обращаться;to try, to treat
trato;trato;noun:el;сделка, обращение;deal, treatment
buscando buscar;buscar;verb;искать;to look for
tampoco;tampoco;adv;тоже не;neither
joven;joven;adj;молодой;young
medio;medio;adj;средний, половина;half, middle
puta;puta;noun:la;шлюха;whore
sentido;sentido;noun:el;смысл, чувство;sense, meaning
esperar_;esperar;verb;ждать, надеяться;to wait, to hope
lejos;lejos;adv;далеко;far
arma armas;arma;noun:el;оружие;weapon
alto;alto;adj;высокий;tall, high
dólares;dólar;noun:el;доллар;dollar
seis;seis;num;шесть;six
seguridad;seguridad;noun:la;безопасность;security, safety
maldita maldito;maldito;adj;проклятый;damn, cursed
palabra palabras;palabra;noun:la;слово;word
queda;quedar;verb;оставаться;to stay, to remain
oficina;oficina;noun:la;офис;office
matar mató;matar;verb;убивать;to kill
cama;cama;noun:la;кровать;bed
además;además;adv;кроме того;besides
último última;último;adj;последний;last
oído;oído;noun:el;слух, ухо;hearing, ear
recuerdo recuerda recuerdas;recordar;verb;помнить, вспоминать;to remember
acerca;acerca;adv;о, относительно;about
luz;luz;noun:la;свет;light
correcto;correcto;adj;правильный;correct
demonios;demonio;noun:el;демон, чёрт;demon, devil
dormir;dormir;verb;спать;to sleep
sitio;sitio;noun:el;место;place, site
conseguir;conseguir;verb;добиваться, получать;to get, to obtain
marido;marido;noun:el;муж;husband
paz;paz;noun:la;мир, покой;peace
idiota;idiota;noun:el;идиот;idiot
plan;plan;noun:el;план;plan
peor;peor;adj;худший, хуже;worse, worst
pueblo;pueblo;noun:el;посёлок, народ;town, people
basta;bastar;verb;хватать, быть достаточно;to be enough
música;música;noun:la;музыка;music
país;país;noun:el;страна;country
rey;rey;noun:el;король;king
perdón;perdón;noun:el;прощение, извините;pardon, sorry
falta;falta;noun:la;нехватка, ошибка;lack, fault
diablos;diablo;noun:el;дьявол, чёрт;devil
perdido perder;perder;verb;терять, проигрывать;to lose
diez;diez;num;десять;ten
lleva llevar;llevar;verb;нести, носить, везти;to carry, to take, to wear
hospital;hospital;noun:el;больница;hospital
fuego;fuego;noun:el;огонь;fire
poner;poner;verb;класть, ставить;to put
calle;calle;noun:la;улица;street
acaba acabo;acabar;verb;заканчивать;to finish
prueba;prueba;noun:la;доказательство, испытание;proof, test
increíble;increíble;adj;невероятный;incredible
real;real;adj;настоящий, реальный;real
libro;libro;noun:el;книга;book
orden;orden;noun:el;порядок, приказ;order
especial;especial;adj;особенный;special
café;café;noun:el;кофе, кафе;coffee, café
duro;duro;adj;жёсткий, трудный;hard, tough
empezar;empezar;verb;начинать;to begin
afuera;afuera;adv;снаружи;outside
perro;perro;noun:el;собака;dog
cielo;cielo;noun:el;небо;sky, heaven
puesto;puesto;noun:el;место, пост;position, stall
viaje;viaje;noun:el;поездка, путешествие;trip, journey
detrás;detrás;adv;сзади, позади;behind
cuarto;cuarto;noun:el;комната, четверть;room, quarter
querida querido;querido;adj;дорогой, любимый;dear
libre;libre;adj;свободный;free
suena;sonar;verb;звучать;to sound
cambio cambiar;cambiar;verb;менять, изменять;to change
película;película;noun:la;фильм;movie
millones;millón;noun:el;миллион;million
resto;resto;noun:el;остаток;rest
extraño;extraño;adj;странный;strange
presidente;presidente;noun:el;президент;president
ropa;ropa;noun:la;одежда;clothes
agente;agente;noun:el;агент;agent
información;información;noun:la;информация;information
raro;raro;adj;редкий, странный;rare, weird
usar;usar;verb;использовать;to use
perfecto;perfecto;adj;идеальный;perfect
derecho;derecho;noun:el;право;right
modo;modo;noun:el;способ, режим;way, mode
ayer;ayer;adv;вчера;yesterday
demás;demás;adj;остальной;rest, other
noticias;noticia;noun:la;новость;news
asesino;asesino;noun:el;убийца;murderer
control;control;noun:el;контроль;control
odio;odiar;verb;ненавидеть;to hate
frente;frente;noun:el;фронт, перед;front
sexo;sexo;noun:el;секс;sex
divertido;divertido;adj;весёлый, забавный;fun, funny
grupo;grupo;noun:el;группа;group
asunto;asunto;noun:el;дело, вопрос;matter, issue
mensaje;mensaje;noun:el;сообщение;message
encima;encima;adv;сверху;on top
atención;atención;noun:la;внимание;attention
diferente;diferente;adj;другой, разный;different
cállate;callar;verb;молчать;to be quiet
daño;daño;noun:el;вред, ущерб;harm, damage
sucede;suceder;verb;случаться;to happen
siguiente;siguiente;adj;следующий;next
sino;sino;conj;а, но;but rather
médico;médico;noun:el;врач;doctor
boca;boca;noun:la;рот;mouth
error;error;noun:el;ошибка;mistake
jamás;jamás;adv;никогда;never
largo;largo;adj;длинный;long
pena;pena;noun:la;печаль, жалость;sorrow, pity
voz;voz;noun:la;голос;voice
futuro;futuro;noun:el;будущее;future
secreto;secreto;noun:el;секрет;secret
baño;baño;noun:el;ванная, туалет;bathroom
mil;mil;num;тысяча;thousand
novia;novia;noun:la;девушка, невеста;girlfriend, bride
propia propio;propio;adj;собственный;own
sueño;sueño;noun:el;сон, мечта;sleep, dream
fuerza;fuerza;noun:la;сила;strength
ambos;ambos;det;оба;both
dolor;dolor;noun:el;боль;pain
encanta_;encantar;verb;очень нравиться, очаровывать;to love, to delight
edad;edad;noun:la;возраст;age
pie;pie;noun:el;нога, ступня;foot
negro;negro;adj;чёрный;black
ganar;ganar;verb;выигрывать, зарабатывать;to win, to earn
aire;aire;noun:el;воздух;air
lamento;lamentar;verb;сожалеть;to regret
asesinato;asesinato;noun:el;убийство;murder
adónde;adónde;adv;куда;where to
disculpe;disculpar;verb;извинять;to excuse
cita;cita;noun:la;свидание, цитата;date, appointment
sistema;sistema;noun:el;система;system
gusto;gusto;noun:el;вкус, удовольствие;taste, pleasure
pobre;pobre;adj;бедный;poor
negocio;negocio;noun:el;бизнес;business
mente;mente;noun:la;разум;mind
campo;campo;noun:el;поле, деревня;field, countryside
situación;situación;noun:la;ситуация;situation
tras;tras;prep;после, за;after, behind
hotel;hotel;noun:el;отель;hotel
funciona;funcionar;verb;работать, функционировать;to work
foto;foto;noun:la;фото;photo
abogado;abogado;noun:el;адвокат;lawyer
alrededor;alrededor;adv;вокруг;around
próxima;próximo;adj;следующий, ближайший;next
terminado;terminar;verb;заканчивать;to finish
pagar;pagar;verb;платить;to pay
personal;personal;adj;личный;personal
ocurre;ocurrir;verb;происходить;to occur
mitad;mitad;noun:la;половина;half
pelo;pelo;noun:el;волосы;hair
oficial;oficial;noun:el;офицер;officer
compañía;compañía;noun:la;компания;company
relación;relación;noun:la;отношения;relationship
montón;montón;noun:el;куча;pile, lot
cena;cena;noun:la;ужин;dinner
través;través;other;через (a través de);through (a través de)
accidente;accidente;noun:el;авария, несчастный случай;accident
caja;caja;noun:la;коробка, касса;box
tranquilo;tranquilo;adj;спокойный;calm
bonito;bonito;adj;красивый;pretty
nada;nada;pron;ничего;nothing
o;o;conj;или;or
entonces;entonces;adv;тогда, итак;then, so
hola;hola;interj;привет;hello
cada;cada;det;каждый;each, every
cualquier;cualquier;det;любой;any
probablemente;probablemente;adv;вероятно;probably
habitación;habitación;noun:la;комната;room
simplemente;simplemente;adv;просто;simply
preocupes;preocupar;verb;беспокоить;to worry
anoche;anoche;adv;вчера вечером;last night
general;general;adj;общий, генеральный;general"""
DROP = "oh eh ah uh ay the john jack sam york mas aqui asi".split()
forms = [l.strip() for l in open('/Users/denis/dev/cards/data/sources/es/work/in_00.txt') if l.strip()]
out = {}
for line in D.split("\n"):
    f, lem, pos, ru, en = line.split(";")
    word = lem
    if pos.startswith("noun:"):
        word = pos[5:] + " " + lem; pos = "noun"
    for x in f.split():
        x = x.rstrip("_")
        if x == "mas": continue
        out[x] = [lem, pos, word, ru, en]
for d in DROP: out[d] = None
miss = [x for x in forms if x not in out]
extra = [x for x in out if x not in forms]
print("missing", miss, "extra", extra)
res = {x: out[x] for x in forms if x in out}
for x in miss: res[x] = None
json.dump(res, open('/Users/denis/dev/cards/data/sources/es/work/out_00.json','w'), ensure_ascii=False, indent=0)
print(len(res), sum(v is None for v in res.values()))
