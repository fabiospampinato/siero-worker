
/* IMPORT */

import {describe} from 'fava';
import delay from 'promise-resolve-timeout';
import SieroWorker from '../dist/index.js';

/* MAIN */

describe ( 'Siero Worker', it => {

  it ( 'can pass values back and forth between realms', async t => {

    t.plan ( 11 );

    Error.stackTraceLimit = 0;

    const worker = new SieroWorker ();

    const API = {
      deepEqual: ( a, b ) => {
        t.deepEqual ( a, b );
      },
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
      /* HELPERS */
      Error.stackTraceLimit = 0;
      class Unserializable {}
      /* FUNCTION METADATA */
      await API.is ( API.sumWith.name, 'sumWith' );
      await API.is ( API.sumWith.length, 3 );
      /* FUNCTION CALL - SUCCESS */
      const result1 = await API.sumWith ( 4, 9, Math.sqrt );
      await API.is ( result1, 5 );
      const result2 = await API.sumWith.call ( null, 4, 9, Math.sqrt );
      await API.is ( result2, 5 );
      const result3 = await API.sumWith.apply ( null, [4, 9, Math.sqrt] );
      await API.is ( result3, 5 );
      const result4 = await API.sumWith.bind ( null, 4, 9, Math.sqrt )();
      await API.is ( result4, 5 );
      /* FUNCTION CALL - ERROR - CALL */
      try {
        API.is ( new Unserializable (), new Unserializable () );
      } catch ( error ) {
        await API.deepEqual ( error, new Error ( 'Unserializable value' ) );
      }
    };

    worker.global ( 'API', API );
    worker.eval ( `(${plugin.toString ()})()` );

    await delay ( 50 );

    worker.terminate ();

  });

});
