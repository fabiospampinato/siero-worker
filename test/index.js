
/* IMPORT */

import {describe} from 'fava';
import delay from 'promise-resolve-timeout';
import SieroWorker from '../dist/index.js';

/* MAIN */

describe ( 'Siero Worker', it => {

  it ( 'can pass values back and forth between realms', async t => {

    t.plan ( 2 );

    const worker = new SieroWorker ();

    const API = {
      is: ( a, b ) => {
        t.is ( a, b );
      },
      async sumWith ( a, b, transformer ) {
        const result = await transformer ( a ) + await transformer ( b );
        t.is ( result, 5 );
        return result;
      }
    };

    const plugin = async () => {
      const result = await API.sumWith ( 4, 9, Math.sqrt );
      await API.is ( result, 5 );
    };

    worker.global ( 'API', API );
    worker.eval ( `(${plugin.toString ()})()` );

    await delay ( 50 );

    worker.terminate ();

  });

});
