/* 天气 */
/* ═══════════════════════════════════════
   🌤️ WEATHER MODULE
   ═══════════════════════════════════════ */
(function(){
  const WEATHER_CITY_KEY = 'candyJarWeatherCity';
  const WEATHER_CACHE_KEY = 'candyJarWeatherCache';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 min

  // city name → display name mapping for Chinese cities
  const CITY_DISPLAY = {
    '深圳':'深圳','北京':'北京','上海':'上海','广州':'广州',
    '成都':'成都','杭州':'杭州','武汉':'武汉','重庆':'重庆',
    'San Francisco':'旧金山','New York':'纽约','Tokyo':'东京','London':'伦敦','Paris':'巴黎'
  };

  // weather code → emoji + description (WMO codes used by Open-Meteo)
  const WMO = {
    0:['☀️','晴'],1:['🌤️','大部晴'],2:['⛅','多云'],3:['☁️','阴'],
    45:['🌫️','雾'],48:['🌫️','雾凇'],
    51:['🌦️','小毛毛雨'],53:['🌦️','毛毛雨'],55:['🌧️','密毛毛雨'],
    56:['🌧️','冻毛毛雨'],57:['🌧️','冻雨'],
    61:['🌧️','小雨'],63:['🌧️','中雨'],65:['🌧️','大雨'],
    66:['🌧️','冻雨'],67:['🌧️','冻大雨'],
    71:['🌨️','小雪'],73:['🌨️','中雪'],75:['❄️','大雪'],
    77:['❄️','雪粒'],
    80:['🌦️','阵雨'],81:['🌧️','中阵雨'],82:['⛈️','暴雨'],
    85:['🌨️','阵雪'],86:['❄️','大阵雪'],
    95:['⛈️','雷暴'],96:['⛈️','雷暴+冰雹'],99:['⛈️','雷暴+大冰雹']
  };

  function getWMO(code){return WMO[code]||['🌡️','未知'];}

  let currentCity = '深圳';
  try{ const saved=localStorage.getItem(WEATHER_CITY_KEY); if(saved) currentCity=saved; }catch(e){}

  // geocoding: city name → lat/lon using Open-Meteo geocoding API
  // 常用城市直接写坐标，少一次网络请求
  const CITY_COORDS={
    '深圳':{lat:22.5431,lon:114.0579,name:'深圳'},'北京':{lat:39.9042,lon:116.4074,name:'北京'},
    '上海':{lat:31.2304,lon:121.4737,name:'上海'},'广州':{lat:23.1291,lon:113.2644,name:'广州'},
    '成都':{lat:30.5728,lon:104.0668,name:'成都'},'杭州':{lat:30.2741,lon:120.1551,name:'杭州'},
    '武汉':{lat:30.5928,lon:114.3055,name:'武汉'},'重庆':{lat:29.5630,lon:106.5516,name:'重庆'}
  };
  // 带超时的fetch，网卡住时不会一直转圈
  async function fetchT(url,ms){
    const ctl=new AbortController();const t=setTimeout(function(){ctl.abort();},ms||10000);
    try{return await fetch(url,{signal:ctl.signal});}finally{clearTimeout(t);}
  }

  async function geocode(city){
    if(CITY_COORDS[city]) return CITY_COORDS[city];
    const r=await fetchT('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(city)+'&count=1&language=zh');
    const d=await r.json();
    if(!d.results||!d.results.length) throw new Error('city not found');
    return {lat:d.results[0].latitude, lon:d.results[0].longitude, name:d.results[0].name};
  }

  async function fetchWeather(city){
    // check cache
    try{
      const cache=JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY)||'{}');
      if(cache.city===city && cache.ts && Date.now()-cache.ts < CACHE_DURATION && cache.data){
        return cache.data;
      }
    }catch(e){}

    const geo=await geocode(city);
    const url='https://api.open-meteo.com/v1/forecast?latitude='+geo.lat+'&longitude='+geo.lon
      +'&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m'
      +'&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3';
    const r=await fetchT(url);
    const d=await r.json();
    if(!d.current||!d.daily) throw new Error('bad weather data');
    const result={geo,data:d};

    // cache it
    try{localStorage.setItem(WEATHER_CACHE_KEY,JSON.stringify({city,ts:Date.now(),data:result}));}catch(e){}
    return result;
  }

  function windDir(deg){
    const dirs=['北','东北','东','东南','南','西南','西','西北'];
    return dirs[Math.round(deg/45)%8]+'风';
  }

  function getDayLabel(i,dateStr){
    if(i===0) return '今天';
    if(i===1) return '明天';
    if(i===2) return '后天';
    return dateStr;
  }

  function renderWeather(result){
    const card=document.getElementById('weather-card');
    const cur=result.data.current;
    const daily=result.data.daily;
    const wmo=getWMO(cur.weather_code);
    const displayName=CITY_DISPLAY[currentCity]||result.geo.name||currentCity;
    const now=new Date();
    const timeStr=(now.getHours()+'').padStart(2,'0')+':'+(now.getMinutes()+'').padStart(2,'0')+' 更新';

    let forecastHTML='';
    for(let i=0;i<3;i++){
      const dWmo=getWMO(daily.weather_code[i]);
      forecastHTML+='<div class="weather-forecast-day">'
        +'<div class="weather-forecast-label">'+getDayLabel(i,daily.time[i])+'</div>'
        +'<div class="weather-forecast-temps">'+dWmo[1]+'</div>'
        +'<div class="weather-forecast-temps">'+Math.round(daily.temperature_2m_max[i])+'° <span>/ '+Math.round(daily.temperature_2m_min[i])+'°</span></div>'
        +'</div>';
    }

    card.innerHTML=
      '<div class="weather-header">'
        +'<div class="weather-city" onclick="openWeatherCity()">'+displayName+'</div>'
        +'<div class="weather-update">'+timeStr+'</div>'
      +'</div>'
      +'<div class="weather-now">'
        +'<div class="weather-temp-main">'+Math.round(cur.temperature_2m)+'<span class="weather-temp-unit">°C</span></div>'
        +'<div class="weather-desc">'+wmo[1]+'</div>'
      +'</div>'
      +'<div class="weather-details">'
        +'<div class="weather-detail-item"><div class="weather-detail-label">体感</div><div class="weather-detail-val">'+Math.round(cur.apparent_temperature)+'°</div></div>'
        +'<div class="weather-detail-item"><div class="weather-detail-label">湿度</div><div class="weather-detail-val">'+cur.relative_humidity_2m+'%</div></div>'
        +'<div class="weather-detail-item"><div class="weather-detail-label">风</div><div class="weather-detail-val">'+windDir(cur.wind_direction_10m)+' '+Math.round(cur.wind_speed_10m)+'</div></div>'
      +'</div>'
      +'<div class="weather-forecast">'+forecastHTML+'</div>';
  }

  function renderError(msg){
    const card=document.getElementById('weather-card');
    card.innerHTML='<div class="weather-error">'+msg+'<span onclick="loadWeather()">重试</span></div>';
  }

  window.loadWeather=async function(){
    const card=document.getElementById('weather-card');
    card.innerHTML='<div class="weather-loading">正在获取天气...</div>';
    try{
      const result=await fetchWeather(currentCity);
      renderWeather(result);
    }catch(e){
      // 网络不行时先显示上次的天气，总比一直转圈好
      try{
        const cache=JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY)||'{}');
        if(cache.city===currentCity&&cache.data){renderWeather(cache.data);return;}
      }catch(e2){}
      renderError('获取天气失败');
    }
  };

  window.openWeatherCity=function(){
    document.getElementById('weather-city-modal').classList.add('show');
    const inp=document.getElementById('weather-city-input');
    inp.value=currentCity;
    inp.focus();
    inp.select();
  };

  window.closeWeatherCity=function(){
    document.getElementById('weather-city-modal').classList.remove('show');
  };

  window.pickWeatherCity=function(city){
    document.getElementById('weather-city-input').value=city;
  };

  window.confirmWeatherCity=function(){
    const inp=document.getElementById('weather-city-input');
    const city=inp.value.trim();
    if(!city) return;
    currentCity=city;
    try{localStorage.setItem(WEATHER_CITY_KEY,city);}catch(e){}
    closeWeatherCity();
    loadWeather();
  };

  // enter key in input
  document.getElementById('weather-city-input').addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();confirmWeatherCity();}
  });

  // auto refresh every 30 min
  setInterval(function(){loadWeather();},CACHE_DURATION);

  // initial load
  loadWeather();
})();
