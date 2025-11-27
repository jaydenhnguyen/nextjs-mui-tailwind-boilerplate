import * as React from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class AppDocument extends Document {
  render(): React.ReactElement {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>

        <body className="font-proximaNova">
        <Main />
        <NextScript />
        </body>
      </Html>
    );
  }
}
