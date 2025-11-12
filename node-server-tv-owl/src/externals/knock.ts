import Knock from '@knocklabs/node';
import { KNOCK_SECRET_KEY } from '../config';

const knockClient = new Knock({
  apiKey: KNOCK_SECRET_KEY, 
});

export default knockClient;