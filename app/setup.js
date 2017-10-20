import url from 'url';
import qs from 'querystring';

window.query = qs.parse(url.parse(location.href).query);
