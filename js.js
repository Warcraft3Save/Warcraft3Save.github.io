function encodeUTF8(s) {
    var i = 0, bytes = new Uint8Array(s.length * 4);
    for (var ci = 0; ci != s.length; ci++) {
        var c = s.charCodeAt(ci);        
        if (c < 128) {
            bytes[i++] = c;
            continue;
        }
        if (c < 2048) {
            bytes[i++] = c >> 6 | 192;
        }
        else {
            if (c > 0xd7ff && c < 0xdc00) {
                if (++ci >= s.length)
                    throw new Error('UTF-8 encode: incomplete surrogate pair');
                var c2 = s.charCodeAt(ci);
                if (c2 < 0xdc00 || c2 > 0xdfff)
                    throw new Error('UTF-8 encode: second surrogate character 0x' + c2.toString(16) + ' at index ' + ci + ' out of range');
                c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
                bytes[i++] = c >> 18 | 240;
                bytes[i++] = c >> 12 & 63 | 128;
            }
            else
                bytes[i++] = c >> 12 | 224;
            bytes[i++] = c >> 6 & 63 | 128;
        }
        bytes[i++] = c & 63 | 128;
    }
    return bytes.subarray(0, i);
};
function decodeUTF8(bytes) {
    var i = 0, s = '';
    while (i < bytes.length) {
        var c = bytes[i++];
        if (c > 127) {
            if (c > 191 && c < 224) {
                if (i >= bytes.length)
                    throw new Error('UTF-8 decode: incomplete 2-byte sequence');
                c = (c & 31) << 6 | bytes[i++] & 63;
            }
            else if (c > 223 && c < 240) {
                if (i + 1 >= bytes.length)
                    throw new Error('UTF-8 decode: incomplete 3-byte sequence');
                c = (c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
            }
            else if (c > 239 && c < 248) {
                if (i + 2 >= bytes.length)
                    throw new Error('UTF-8 decode: incomplete 4-byte sequence');
                c = (c & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
            }
            else
                throw new Error('UTF-8 decode: unknown multibyte start 0x' + c.toString(16) + ' at index ' + (i - 1));
        }
        if (c <= 0xffff)
            s += String.fromCharCode(c);
        else if (c <= 0x10ffff) {
            c -= 0x10000;
            s += String.fromCharCode(c >> 10 | 0xd800);
            s += String.fromCharCode(c & 0x3FF | 0xdc00);
        }
        else
            throw new Error('UTF-8 decode: code point 0x' + c.toString(16) + ' exceeds UTF-16 reach');
    }
    return s;
};
function longToByteArray(long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var index = 0; index < byteArray.length; index++) {
        var byte = long & 0xff;
        byteArray[index] = byte;
        long = (long - byte) / 256;
    }
    return byteArray;
};
function byteArrayToLong(byteArray) {
    var value = 0n;
    var usesbyte = 256n;
    for (var i = byteArray.length - 1; i >= 0; i--) {
        value = (value * 256n) + BigInt(byteArray[i]);
    }
    return value;
};
function StringHash(s) {
    if (s === "")
        return 0;
    var ss = encodeUTF8(s);
    for (var index = 0; index < ss.length; index++) {
        if (ss[index] >= 97 && ss[index] <= 122) {
            ss[index] -= 32;
        }
        else if (ss[index] == 47) {
            ss[index] = 92;
        }
    }
    var l = BigInt(ss.length);
    var a = 0n;
    var b = 0x9e3779b9n;
    var c = b;
    var p = [0n, 8n, 16n, 24n, 0n, 8n, 16n, 24n, 8n, 16n, 24n];
    var r = [-13n, 8n, -13n, -12n, 16n, -5n, -3, 10n, -15n];
    while (ss.length >= 12) {
        a += byteArrayToLong([ss[8], ss[9], ss[10], ss[11]]);
        b += byteArrayToLong([ss[4], ss[5], ss[6], ss[7]]);
        c += byteArrayToLong([ss[0], ss[1], ss[2], ss[3]]);
        r.forEach(function (i) {
            var is = i > 0n;
            var aa = a;
            var bb = b;
            a = aa;
            b = bb;
            //a = (c - b - a) ^ (a << (is?i :(a & 0xFFFFFFFF  )) >> -i);
            a = (c - b - a) ^ (is ? a << BigInt(i) : (a & 0xffffffffn) >> BigInt(-i));
            b = aa;
            c = bb & 0xffffffffn;
        });
        ss = ss.slice(12, ss.length);
    }
    var d = [c, b, a + l];
    for (var i = 0; i < ss.length; i++) {
        d[Math.floor(i / 4)] += BigInt(ss[i]) << p[i];
    }
    c = d[0];
    b = d[1];
    a = d[2];
    r.forEach(function (i) {
        var is = i > 0;
        var aa = a;
        var bb = b;
        a = aa;
        b = bb;
        //a = (c - b - a) ^ (a << (is?i :(a & 0xFFFFFFFF )) >> -i);
        a = (c - b - a) ^ (is ? a << BigInt(i) : (a & 0xffffffffn) >> BigInt(-i));
        b = aa;
        c = bb & 0xffffffffn;
    });
    var e = a & 0xffffffffn;
    return e - (1n << 32n) * (e >> 31n);
};

function jx(str, indx){
    if(indx >= 91){
        return str.substr(indx-91,1)
    }
    return str.substr(indx, 1)
}
function j0(MD, ME){
    return MD - ME * parseInt(MD / ME)
}
function j2(MD, Od, Na){
    let L9 = 0;
    let Of = "";
    let Oe = Na.length;
    while(L9 < Od){
        L9 += 1;
        Of += jx(Na, j0(MD, Oe)+5);
        MD = parseInt(MD / Oe);
    }
    return Of;
}
function j3(MD, Od){
    let M3 = "Q}W{9zx/.2q]J[0Z?X>4_IYRO5c,yL8e=rpoD:C<VM6~TEPU`1Bn+3uvitNb!a'@A;#Sl$ms%kjfG^gh&K7*Fw(Hd)-";
    return j2(MD, Od, M3);
}
function ld(Oh, Oi){
    let Oj = parseInt(StringHash(String(Oh)));
    if(Oj < 0){
        Oj *= -1;
    }
    return j3(Oj, Oi);
}
function le(unit_type, Oi){
    return j3(unit_type, Oi);
}
function lh(str){
    let s = Math.abs(parseInt(StringHash(str)));
    return j3(s, 4);
}
var body = document.body;
var HeroItemArr = [];
var AbilityArr = [];
var Hero = 0;
var Bag = 0;
var inp_name = document.createElement("input");
var inp_vrs = document.createElement('input');

var inp_gold = document.createElement('input');
var inp_lumber = document.createElement('input');

var inp_level = document.createElement('input');

var inp_hero;
var inp_bag;


for(let i = 0; i < 30; i++){ HeroItemArr.push(0)}

function selectItem(i, a){
    HeroItemArr[a] = +i.value;
}
function selectHero(i, a){
    Hero = +i.value;
}
function selectBag(i, a){
    Bag = +i.value;
}

function createAbilityCell()
{
    for(let i = 0; i < AbilityArray.length; i++){
        var inp = document.createElement('input');
        inp.placeholder = AbilityArray[i].substr(14);
        AbilityArr.push(inp);
        if(AbilityArray[i] == "") continue;
        body.appendChild(inp);
    }
}

function createItemCell(num){
    var sel = document.createElement("select");
    for(let i = 0; i < ItemArray.length; i++){
        let opt = document.createElement("option");
        opt.setAttribute("class", num);
        opt.setAttribute("value", i);
        let s = ItemArray[i].substr(14);
        opt.appendChild(document.createTextNode(s));
        sel.appendChild(opt);
    }
    
    sel.setAttribute('onclick', "selectItem("+"this"+","+num+")")
    return sel
    
};
function createUnitCell(num){
    var sel = document.createElement("select");
    for(let i = 0; i < UnitArray.length; i++){
        if(UnitArray[i] == "") continue;
        let opt = document.createElement("option");
        opt.setAttribute("class", num);
        opt.setAttribute("value", i);
        let s = UnitArray[i].substr(14);
        opt.appendChild(document.createTextNode(s));
        sel.appendChild(opt);
    }
    if(num == 0){
        sel.setAttribute('onclick', "selectHero("+"this"+","+num+")")
    }else{
        sel.setAttribute('onclick', "selectBag("+"this"+","+num+")")
    }
    return sel
    
};
var div_name = document.createElement("div");
inp_name.placeholder = "nick name";
body.appendChild(div_name);
div_name.appendChild(inp_name);

inp_vrs.placeholder = "version map";
div_name.appendChild(inp_vrs);

inp_gold.placeholder = "gold <150.000";
inp_lumber.placeholder = "lumber < 10.000";
inp_level.placeholder = "level hero";

div_name.appendChild(inp_level);
div_name.appendChild(inp_gold);
div_name.appendChild(inp_lumber);

var inp_res1 = document.createElement('input')
var inp_res2 = document.createElement('input')

var div_hero = document.createElement('div')
var sel_hero = createUnitCell(0);
var sel_bag = createUnitCell(1);
div_hero.appendChild(document.createTextNode("Hero select"))
div_hero.appendChild(sel_hero)
div_hero.appendChild(document.createTextNode("Bag select"))
div_hero.appendChild(sel_bag)
body.appendChild(div_hero)


var div_items = document.createElement('div')
for(let i = 0; i<6;i++){
    let div = document.createElement('div');
    let ss = document.createTextNode("Hero Item " + (i+1));
    div.appendChild(ss);
    div.appendChild(createItemCell(i));
    div_items.appendChild(div);
    div.setAttribute('style','margin-top:5px; display: inline;')
}

for(let i = 6; i < 30; i++){
    let div = document.createElement('div')
    let s = document.createTextNode("Courier item " + (i-5))
    div.appendChild(s);
    div.appendChild(createItemCell(i));
    div_items.appendChild(div);
    div.setAttribute('style','margin-top:5px; display: inline;')
}
body.appendChild(div_items)
div_items.setAttribute('style', 'columns:5; color:lightgreen; width: 1366px;')

createAbilityCell()


function codeCreate(){
    var code1 = "";
    var code2 = "";
    
    code1 += j3(parseInt(inp_vrs.value*1000)-1, 4);
    code1 += ld(inp_name.value, 6);
    code1 += le(parseInt(Hero), 2);
    code1 += j3(parseInt(inp_level.value), 2);
    code1 += le(parseInt(Bag), 2);
    
    HeroItemArr.forEach(e=>{
        code1 += j3(parseInt(e), 2);
    });
    code1 += j3(parseInt(inp_gold.value), 4)
    code1 += j3(parseInt(inp_lumber.value), 4)
    AbilityArr.forEach(e=>{
        code2 += j3(e.value, 1);
    });
    code1 += lh(code1);
    let lhc1 = lh(code1);
    let lhc2 = lh(code2)
    code2 += lhc1 + lhc2;
    inp_res1.value = "-Load1 " + code1;
    inp_res2.value = "-Load2 " + code2;
}

var div_res = document.createElement('div');

inp_res1.placeholder = "code1";
inp_res2.placeholder = "code2";
inp_res1.setAttribute('readonly','')
inp_res2.setAttribute('readonly','')
div_res.appendChild(inp_res1);
div_res.appendChild(inp_res2);
div_res.setAttribute('style', 'margin-top:50px')
body.appendChild(div_res);
var btn = document.createElement("button");
btn.appendChild(document.createTextNode("CREATE SAVE CODES"));
btn.setAttribute('onclick', 'codeCreate()')
div_res.appendChild(btn);