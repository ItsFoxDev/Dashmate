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
settingsMenu();
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
  // Update the theme colour
  // document.getElementById('themecolour').innerHTML=':root{--th:'+settings.theme+' !important;}';
  // document.getElementById('themefont').innerHTML='body{--f:'+settings.font+';--font:var(--f, JetBrains Mono) !important;}';
  // cl('🎨 Updated theme data');
  var toggleClasses = '["privatemode","boldfont","lightmode","bgcol"]';
  var toggleClassesArray = JSON.parse(toggleClasses);
  toggleClassesArray.forEach(function(e){
    document.body.classList.toggle(e, settings[e]);
  });
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
  loadUsImages('nature','naturefeed',24);
}
var co;
function loadUsImages(c,e,n){
  co=c;
  for (let step = 0; step < n; step++) {
    var img = document.createElement('img');
    img.classList.add('unloaded');
    document.getElementById(e).appendChild(img);
    img.onclick=function(){
      sw(this)
    }
    setTimeout(function(){
      if (co === c){
        var el = document.querySelector('#'+e+' img:not([src])');
        el.src = 'https://source.unsplash.com/random?'+c+'&cheesewick='+Math.random();
        el.onload = function(){
          el.classList.remove('unloaded')
        };
      }
      if (step === 23 && co === 'nature'){
        loadUsImages('city','cityfeed',24);
      }
    }, step*120);
  }
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
  document.getElementById('bgimg').src=e.src;
  settings.backgroundid=e.src;
  window.store.set('settings',JSON.stringify(settings));
  updateSettings();
  cl('🖼️ Set background to '+e.src);
}