function cl(m){
  console.log(m);
  var l = document.getElementById('logs')
  l.innerHTML+='<log><ic>'+m[0]+m[1]+'</ic><time>dashmate.main @ '+Date.now()+'</time><desc>'+m.slice(3)+'</desc></log>';
  if (settings){
    if (settings.autoscroll == true){
      l.scrollTop = l.scrollHeight;
    }
  }
}
function exportFile(data, fileName) {
  var blob = new Blob([data], {type: "text/plain"}),
    url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
  cl('📤 Exported file '+fileName);
}

cl('🌉 Bridged electron.window.store');

function settingsMenu(){
  document.body.classList.add('dark');
  document.getElementById('settingsWindow').classList.add('show');
  cl('🔧 Opened Settings Menu');
}
function closeSettings(){
  document.body.classList.remove('dark');
  document.getElementById('settingsWindow').classList.remove('show');
  cl('🔧 Closed Settings menu')
}

function switchSetting(e){
  switchClass(e,'active');
  switchClass(document.querySelector('.menu[menu="'+e.textContent.trim()+'"]'),'activeMenu');
  cl('🔄 Switched settings menu to '+e.textContent.trim());
}

function switchClass(e,c){
  document.querySelectorAll('.'+c).forEach(function(e){
    e.classList.toggle(c);
  });
  e.classList.add(c);
}


document.getElementById('starter').click();

var settings;
async function getSettings(){
  settings = JSON.parse(await window.store.get('settings'));
  if (!settings){
    resetSettings();
    cl('⚙️ Set settings to default')
  }
  cl('📥 Fetched settings');
}
getSettings().then(() => {
  settingsSetup();
  updateSettings();
});

function settingsSetup(){
  document.querySelectorAll('#settingsWindow *[setting]').forEach(function(e){
    var sn=e.getAttribute('setting')
    e.value=settings[sn];
    if (e.tagName == 'BUTTON' && settings[sn] == true){
      e.classList.add('true');
      cl('🔘 Set button '+sn+' to true')
    }
    e.addEventListener('change', function() {updateValue(this);});
    e.addEventListener('input', function() {updateValue(this);});
    cl('📬 Added eventListener for setting '+sn)
  })
}

function updateValue(e){
  var rv = e.value;
  var sn=e.getAttribute('setting')
  settings[sn] = rv;
  window.store.set('settings', JSON.stringify(settings));
  updateSettings();
  cl('📜 Updated setting '+sn+' to '+settings[sn]);
}

function updateSettings(){
  cl('🔄 Updating settings');
  // Update references to settings in the HTML
  document.querySelectorAll('sv').forEach(function(e){
    e.innerHTML = settings[e.getAttribute('s')];
    cl('🔁 Replaced '+e.getAttribute('s')+' with '+settings[e.getAttribute('s')]);
  })
  document.querySelectorAll('input[setting]').forEach(function(e){
    e.value = settings[e.getAttribute('setting')];
    cl('🔁 Replaced '+e.getAttribute('s')+' with '+settings[e.getAttribute('s')]);
  })
  // Update the theme colour
  // document.getElementById('themecolour').innerHTML=':root{--th:'+settings.theme+' !important;}';
  // document.getElementById('themefont').innerHTML='body{--f:'+settings.font+';--font:var(--f, JetBrains Mono) !important;}';
  // cl('🎨 Updated theme data');
  var toggleClasses = '["privatemode","boldfont","lightmode","bgcol"]';
  var toggleClassesArray = JSON.parse(toggleClasses);
  toggleClassesArray.forEach(function(e){
    document.body.classList.toggle(e, settings[e]);
  });
  if (settings.darkmode){
    document.body.classList.add('darkmode')
  } else {
    document.body.classList.remove('darkmode')
  }
  if (settings.legacyapi){
    document.getElementById('newapi').style.display='none';
    document.getElementById('legacyapi').style.display='block';
  } else {
    document.getElementById('newapi').style.display='block';
    document.getElementById('legacyapi').style.display='none';
  }
  document.getElementById('bgimg').src=settings.backgroundid;
  // document.querySelector('header > i').classList='fas fa-'+settings.windowicon;
  // document.querySelector('#iconpreview').classList='fas fa-'+settings.windowicon;
  
}

document.querySelectorAll('button.toggle').forEach(
  function(e){
    e.addEventListener('click', function(){
      e.classList.toggle('true');
      sn=e.getAttribute('setting');
      if(e.classList.contains('true')){
        settings[sn]=true;
      } else {
        settings[sn]=false;
      }
      window.store.set('settings',JSON.stringify(settings));
      updateSettings();
      cl('📜 Updated setting '+sn+' to '+settings[sn]);
    }
  )}
);



function importSettings(e) {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = function(event) {
    var file = event.target.files[0];

    var reader = new FileReader();
    reader.onload = function() {
      var contents = reader.result;
      settings = JSON.parse(contents);
      window.store.set('settings',JSON.stringify(settings));
      console.log('📥 Imported settings from file ' + file.name);
      settingsSetup();
      updateSettings();
    };

    reader.readAsText(file);
  };

  input.click();
}

/* =====[ WEATHER API ]==================== */
var weatherapi = '8447eb979b514698b6625906242803';

function refreshWeather(){
  const options = {method: 'GET', headers: {'User-Agent': 'insomnia/8.6.1'}};

  fetch('https://api.weatherapi.com/v1/current.json?key='+weatherapi+'&q='+weatherlocation+'&aqi=no', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
}

/* =====[ WALLPAPER FEED ]==================== */
function loadMainFeed(){
  loadUsImages('landscape','naturefeed');
  loadUsImages('city','cityfeed');
}
var co;

async function loadUsImages(c,e,n){
  co=c;
  fetch('./wallpapers/'+c+'.json')
  .then(response => {
    if (!response.ok) {throw new Error('Error: ' + response.statusText);}
    return response.json();
  })
  .then(data => {
    data.forEach(item => {
      const rawUrl = item.urls.small;
      console.log('Added item ' + rawUrl);
      const img = document.createElement('img');
      img.src = rawUrl;
      img.addEventListener('click', function() {
        sw(item.urls.full);
      });
      img.alt = item.alt_description || 'Image';
      document.getElementById(e).appendChild(img);
    });
  })
  .catch(error => console.error('Error fetching the JSON data:', error));
}

loadMainFeed();
var cc;

function wc(l,c){

  document.getElementById('mainwpmenu').classList.add('hide');
  document.getElementById('wpsubtitle').innerHTML=l;
  document.getElementById('wpsub').classList.remove('hide');
  document.getElementById('wpsubfeed').innerHTML=null;
  cc=c;
  loadUsImages(cc,'wpsubfeed',24);
}

function sw(e){
  // const url = new URL(e.src);
  // url.search = '';
  // const cleanSrc = url.toString();

  document.getElementById('bgimg').src=e;
  settings.backgroundid=e;
  window.store.set('settings',JSON.stringify(settings));
  updateSettings();
  cl('🖼️ Set background to '+e);
}

function qws(){
  
  const options = {method: 'GET', headers: {'User-Agent': 'insomnia/8.6.1'}};

  fetch('https://geocoding-api.open-meteo.com/v1/search?name='+document.getElementById('weathersearch').value+'&count=10&language=en&format=json', options)
    .then(response => response.json())
    .then(data => pws(data))
    .catch(err => console.error(err)); 
}
function pws(jr){
  document.getElementById('weathersearchresults').innerHTML=null;
  jr.results.forEach(function(e){
    var el = document.createElement('button');
    el.innerHTML='<img class="wqi" src="https://flagsapi.com/'+e.country_code+'/flat/64.png"> '+e.name+', '+e.admin1+', '+e.country;
    el.onclick=function(){
      settings.weatherlat=e.latitude;
      settings.weatherlong=e.longitude;
      updateSettings();
    }
    document.getElementById('weathersearchresults').appendChil
    d(el);
  })
}

/* =====[ TIME DISPLAY ]====================== */
setInterval(function(){
  const date = new Date();
  const h12 = date.getHours() % 12 || 12;
  const h24 = date.getHours();
  const min = date.getMinutes().toString().padStart(2, '0');
  const sec = date.getSeconds().toString().padStart(2, '0');
  var hrs = h12;
  if (settings.clock24){
    var hrs = h24;
  }
  var ts='<ts>:</ts>';
  if (settings.flashsep){
    var ts='<ts class="flash">:</ts>';
  }
  var sd=sec;
  // if (settings.showseconds){
  //   var sd = ts+sec
  // }
  var ap='';
  if (settings.showampm){
    var ap = ' '+date.getHours() >= 12 ? 'PM' : 'AM';
  }
  // document.getElementById('time').innerHTML=hrs+ts+min+sd+' '+ap;
  document.querySelectorAll('tih').forEach(function(e){e.innerHTML=hrs});
  document.querySelectorAll('tim').forEach(function(e){e.innerHTML=min});
  document.querySelectorAll('tia').forEach(function(e){e.innerHTML=ap});
  if (settings.showseconds){
    document.querySelectorAll('tis').forEach(function(e){e.innerHTML=sec});
    document.querySelectorAll('#secsep').forEach(function(e){e.innerHTML=': '});
  } else {
    document.querySelectorAll('tis').forEach(function(e){e.innerHTML=null});
    document.querySelectorAll('#secsep').forEach(function(e){e.innerHTML=' '});
  }
  if (settings.flashsep){
    if (settings.smoothflash){
      document.querySelectorAll('ts').forEach(function (e){e.classList.add('flashs')});
      document.querySelectorAll('ts').forEach(function (e){e.classList.remove('flash')});
    } else {
      document.querySelectorAll('ts').forEach(function (e){e.classList.add('flash')});
      document.querySelectorAll('ts').forEach(function (e){e.classList.remove('flashs')});
    }
  } else {
    document.querySelectorAll('ts').forEach(function (e){e.classList.remove('flash')});
    document.querySelectorAll('ts').forEach(function (e){e.classList.remove('flashs')});
  }
}, 100);
var weatherapi = '8447eb979b514698b6625906242803';


function fetchWeather(){
  console.log('🌡️ Fetching Weather');
  var fw = document.getElementById('fw');
  fw.onClick=null;
  fw.innerHTML='<i class="fas fa-loader"></i>';
  if (settings.legacyapi){
    var tunit = '';
    if (!settings.usecelsius){
      var tunit='&temperature_unit=fahrenheit'
    }
    cl('🌡️ Fetching weather')
    const options = {method: 'GET', headers: {'User-Agent': 'dashmate'}};
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+settings.weatherlat+'&longitude='+settings.weatherlong+'&current=temperature_2m,apparent_temperature,is_day,precipitation,weather_code'+tunit, options)
      .then(response => response.json())
      .then(response => weatherParse(response))
      .catch(err => console.error(err));
  } else {
    const options = {method: 'GET', headers: {'User-Agent': 'insomnia/8.6.1'}};

    fetch('https://api.weatherapi.com/v1/current.json?key='+weatherapi+'&q='+settings.weatherloc+'&aqi=no', options)
      .then(response => response.json())
      .then(response => weatherParse(response))
      .catch(err => console.error(err));
  }
}
var wbt;
function weatherParse(r){
  if (settings.legacyapi){
    var ts = 'temperature_2m';
    if (settings.usefeelslike){
      var ts = 'apparent_temperature';
    }
    var wc = r.current.weather_code.toString().padStart(2, '0');
    if (wc === '00') {wc = '01';}
    console.log(r);
    console.log(r.current[ts]);
    console.log(r.current_units[ts])
    document.getElementById('weathertemp').innerHTML=r.current[ts]+r.current_units[ts];
    document.getElementById('weatherprecip').innerHTML=r.current.precipitation+r.current_units.precipitation;
    var dn = r.current.is_day ? "d" : "n";
    document.getElementById('weatherimg').src = `https://openweathermap.org/img/wn/${wc}${dn}@2x.png`;
  } else {
    var tempd;
    if (settings.usecelsius){
      tempd=r.current.temp_c+'°C';
    } else {
      tempd=r.current.temp_f+'°F';
    }
    document.getElementById('weathertemp').innerHTML = tempd;
    document.getElementById('weatherprevtemp').innerHTML = tempd;
    document.getElementById('weathersub').innerHTML=r.current.condition.text;
    document.getElementById('weatherprevdesc').innerHTML=r.current.condition.text;
    document.getElementById('weatherimg').src='https:'+r.current.condition.icon;
    document.getElementById('weatherprevimg').src='https:'+r.current.condition.icon;
    document.getElementById('weatherlocation').innerHTML=r.location.name+', '+r.location.region+', '+r.location.country;
  }
  var fw = document.getElementById('fw');
  fw.innerHTML='<i class="fa-solid fa-hourglass-clock"></i>';
  clearTimeout(wbt);
  wbt = setTimeout(function(){
    fw.innerHTML='<i class="fas fa-rotate-right"></i>';
    fw.onClick='fetchWeather();';
  },5E3)
}

var shuffleclock;
function autoShuffle(cat){
  settings.shufflecat=cat;
  window.store.set('settings',JSON.stringify(settings));
  
}

var shuffleclock = setInterval(function(){
  if (settings.autoshuffle){
    document.getElementById('bgimg').src = data.urls.regular;
  }
},1000)

function uas(){
  clearInterval(shuffleclock);
  setTimeout(function(){
    var shuffleclock = setInterval(function(){
      // document.getElementById('bgimg').src='https://source.unsplash.com/random?'+settings.shufflecat+'&anticache='+Math.random();
      fetch('https://api.unsplash.com/photos/random?query=' + settings.shufflecat + '&client_id=JWvq8s9WqJDTgx7nBCX23mvUxTVyOIYVS-oeKDA7Bug')
        .then(response => response.json())
        .then(data => {
          document.getElementById('bgimg').src = data.urls.regular;
        })
        .catch(err => console.error(err));
    }, settings.shuffleinterval * 60000);
  },100);
}






// Run after a bit

setTimeout(function(){
  fetchWeather()
}, 5E2);

setInterval(function(){fetchWeather()}, 6E4);
fetchWeather();