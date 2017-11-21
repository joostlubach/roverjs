declare module 'url' {
  var url: URLStatic
  export = url

  interface URLStatic {
    parse(string: string, parseQueryString?: false, slashesDenoteHost?: boolean): URLObjectWithRawQueryString
    parse(string: string, parseQueryString: true, slashesDenoteHost?: boolean): URLObjectWithParsedQueryString
  
    format(url: URL | URLObjectWithParsedQueryString): string
  
    resolve(from: string, to: string): string
  }

  interface URLObject {
    href:     string
    protocol: string | null
    auth:     string
    hostname: string
    port:     string
    host:     string
    pathname: string | null
    search:   string | null
  }

  interface URLObjectWithRawQueryString extends URLObject {
    query: string
  }

  interface URLObjectWithParsedQueryString extends URLObject {
    query: {[key: string]: any}
  }
}