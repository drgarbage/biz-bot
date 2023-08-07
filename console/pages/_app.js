import { NextIntlClientProvider } from "next-intl"

export default ({ Component, pageProps }) => {
  const getLayout = Component.getLayout || ((page) => page)
  return getLayout(
    <NextIntlClientProvider locale="zh" messages={pageProps.messages}>
      <Component {...pageProps} />
    </NextIntlClientProvider>
  )
}