
/* IMPORT */

import {__module, __internals, serialize, deserialize} from 'siero';
import WebWorker from 'webworker-shim';
import zeptoid from 'zeptoid';
import type {Disposer, Options} from './types';

/* MAIN */

class Worker {

  /* VARIABLES */

  private innerRealm: string;
  private outerRealm: string;
  private webworker: WebWorker;
  private dispose: Disposer;

  /* CONSTRUCTOR */

  constructor ( options?: Options ) {

    this.innerRealm = zeptoid ();
    this.outerRealm = __internals.realm;

    this.webworker = new WebWorker ( `data:text/javascript;charset=utf-8,${encodeURIComponent ( `
      addEventListener ( 'message', (() => {
        const innerRealm = '${this.innerRealm}';
        const outerRealm = '${this.outerRealm}';

        const __module = ${__module.toString ()};
        const Siero = __module ().default;
        const siero = new Siero ({ realm: innerRealm });

        siero.register ( outerRealm, ( command, args ) => {
          postMessage ({ type: 'siero.command', command, args });
        });

        return ({ data }) => {
          if ( data.type === 'siero.command' ) {
            siero.call ( data.command, siero.deserialize ( data.args, { realm: outerRealm } ) );
          } else if ( data.type === 'siero.eval' ) {
            eval.call ( null, data.code );
          } else if ( data.type === 'siero.global' ) {
            globalThis[data.name] = siero.deserialize ( data.value, { realm: outerRealm } );
          }
        };
      })());
    `)}`, options );

    this.webworker.addEventListener ( 'message', ({ data }) => {
      if ( data.type === 'siero.command' ) {
        __internals.call ( data.command, deserialize ( data.args, { realm: this.innerRealm } ) );
      }
    });

    this.dispose = __internals.register ( this.innerRealm, ( command: string, args: string ) => {
      this.webworker.postMessage ({ type: 'siero.command', command, args });
    });

  }

  /* API */

  eval ( code: string ): void { //TODO: Maybe support getting the returned value back also?

    this.webworker.postMessage ({ type: 'siero.eval', code });

  }

  global ( name: string, value: unknown ): void {

    this.webworker.postMessage ({ type: 'siero.global', name, value: serialize ( value, { realm: this.innerRealm } ) });

  }

  terminate (): void {

    this.dispose ();
    this.webworker.terminate ();

  }

}

/* EXPORT */

export default Worker;
