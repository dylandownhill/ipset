import App from './app';
import ISPsetController from './ipsets/ipset.controller';


const app = new App(
  [
    new ISPsetController(),
  ],
  8080,
);

 
app.listen();