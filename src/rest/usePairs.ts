import { useCallback, useEffect, useMemo, useState } from "react"
import {
  KRT,
  LUNA,
  MNT,
  SDT,
  UKRW,
  ULUNA,
  UMNT,
  UST,
  UUSD,
  USDR,
  AUT,
  CAT,
  CHT,
  CNT,
  EUT,
  GBT,
  HKT,
  INT,
  JPT,
  SGT,
  THT,
  UAUD,
  UCAD,
  UCHF,
  UCNY,
  UEUR,
  UGBP,
  UHKD,
  UINR,
  UJPY,
  USGD,
  UTHB,
} from "constants/constants"
import useAPI from "./useAPI"
import { useNetwork } from "hooks"
import mainnetTokens from "constants/mainnet-tokens.json"
import testnetTokens from "constants/testnet-tokens.json"

interface Pairs {
  pairs: Pair[]
}

export interface Pair {
  pair: TokenInfo[]
  contract: string
  liquidity_token: string
}

interface TokenInfo {
  symbol: string
  name: string
  contract_addr: string
  decimals: number
  icon: string
  verified: boolean
}

interface PairsResult {
  pairs: PairResult[]
}

interface PairResult {
  liquidity_token: string
  contract_addr: string
  asset_infos: (NativeInfo | AssetInfo)[]
}

interface TokenResult {
  name: string
  symbol: string
  decimals: number
  total_supply: string
  contract_addr: string
  icon: string
  verified: boolean
}

export let tokenInfos: Map<string, TokenInfo> = new Map<string, TokenInfo>([
  [
    LUNA,
    {
      contract_addr: ULUNA,
      symbol: LUNA,
      name: ULUNA,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    KRT,
    {
      contract_addr: UKRW,
      symbol: KRT,
      name: UKRW,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    MNT,
    {
      contract_addr: UMNT,
      symbol: MNT,
      name: UMNT,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    SDT,
    {
      contract_addr: USDR,
      symbol: SDT,
      name: USDR,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    UST,
    {
      contract_addr: UUSD,
      symbol: UST,
      name: UUSD,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    AUT,
    {
      contract_addr: UAUD,
      symbol: AUT,
      name: UAUD,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    CAT,
    {
      contract_addr: UCAD,
      symbol: CAT,
      name: UCAD,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    CHT,
    {
      contract_addr: UCHF,
      symbol: CHT,
      name: UCHF,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    CNT,
    {
      contract_addr: UCNY,
      symbol: CNT,
      name: UCNY,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    EUT,
    {
      contract_addr: UEUR,
      symbol: EUT,
      name: UEUR,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    GBT,
    {
      contract_addr: UGBP,
      symbol: GBT,
      name: UGBP,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    HKT,
    {
      contract_addr: UHKD,
      symbol: HKT,
      name: UHKD,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    INT,
    {
      contract_addr: UINR,
      symbol: INT,
      name: UINR,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    JPT,
    {
      contract_addr: UJPY,
      symbol: JPT,
      name: UJPY,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    SGT,
    {
      contract_addr: USGD,
      symbol: SGT,
      name: USGD,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
  [
    THT,
    {
      contract_addr: UTHB,
      symbol: THT,
      name: UTHB,
      decimals: 6,
      icon: "",
      verified: true,
    },
  ],
])

export let lpTokenInfos: Map<string, TokenInfo[]> = new Map<
  string,
  TokenInfo[]
>()

export let InitLP = ""

const usePairs = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<Pairs>({ pairs: [] })
  const { loadPairs, loadTokenInfo, loadTokensInfo } = useAPI()
  const { name: networkName } = useNetwork()
  const [currentNetworkName, setCurrentNetworkName] = useState("")

  const getTokenInfo = useCallback(
    async (info: NativeInfo | AssetInfo) => {
      let tokenInfo: TokenInfo | undefined
      if (isAssetInfo(info)) {
        tokenInfo = tokenInfos.get(info.token.contract_addr)
        if (!tokenInfo) {
          const tokenResult: TokenResult | undefined = await loadTokenInfo(
            info.token.contract_addr
          )
          tokenInfo = {
            symbol: "",
            name: "",
            contract_addr: info.token.contract_addr,
            decimals: 6,
            icon: "",
            verified: false,
          }
          if (tokenResult) {
            tokenInfo = {
              symbol: tokenResult.symbol,
              name: tokenResult.name,
              contract_addr: info.token.contract_addr,
              decimals: tokenResult.decimals,
              icon: tokenResult.icon,
              verified: tokenResult.verified,
            }
          }
          tokenInfos.set(info.token.contract_addr, tokenInfo)
        }
      } else if (isNativeInfo(info)) {
        tokenInfo = tokenInfos.get(info.native_token.denom)
      }

      return tokenInfo
    },
    [loadTokenInfo]
  )

  useEffect(() => {
    try {
      if (
        isLoading ||
        (result?.pairs.length > 0 && currentNetworkName === networkName)
      ) {
        return
      }
      setIsLoading(true)
      setCurrentNetworkName(networkName)

      const fetchTokensInfo = async () => {
        try {
          const res = await loadTokensInfo()
          res.forEach((tokenInfo: TokenResult) => {
            tokenInfos.set(tokenInfo.contract_addr, tokenInfo)
          })
        } catch (error) {
          console.error(error)
        }

        ;(networkName === "testnet" ? testnetTokens : mainnetTokens).forEach(
          (token) => {
            if (
              token !== undefined &&
              token.symbol &&
              !tokenInfos.has(token.contract_addr)
            ) {
              tokenInfos.set(token.contract_addr, {
                contract_addr: token.contract_addr,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals ? token.decimals : 6,
                icon: "",
                verified: false,
              })
            }
          }
        )
      }

      const fetchPairs = async () => {
        const res: PairsResult = await loadPairs()
        const pairs = await Promise.all(
          res.pairs.map(async (pairResult: PairResult) => {
            try {
              const tokenInfo1 = await getTokenInfo(pairResult.asset_infos[0])
              const tokenInfo2 = await getTokenInfo(pairResult.asset_infos[1])
              if (tokenInfo1 === undefined || tokenInfo2 === undefined) {
                return
              }

              const lpTokenInfo = await getTokenInfo({
                token: { contract_addr: pairResult.liquidity_token },
              })

              lpTokenInfos.set(pairResult.liquidity_token, [
                tokenInfo1,
                tokenInfo2,
              ])
              if (
                (tokenInfo1.symbol === LUNA && tokenInfo2.symbol === UST) ||
                (tokenInfo1.symbol === UST && tokenInfo2.symbol === LUNA)
              ) {
                InitLP = pairResult.liquidity_token
              }

              lpTokenInfo &&
                tokenInfos.set(pairResult.liquidity_token, {
                  contract_addr: pairResult.liquidity_token,
                  name: lpTokenInfo.name,
                  symbol: lpTokenInfo.symbol,
                  decimals: lpTokenInfo.decimals,
                  icon: "",
                  verified: false,
                })

              let pair: Pair = {
                contract: pairResult.contract_addr,
                pair: [tokenInfo1, tokenInfo2],
                liquidity_token: pairResult.liquidity_token,
              }

              return pair
            } catch (error) {
              console.error(error)
            }
            return undefined
          })
        )

        if (pairs) {
          setResult({
            pairs: pairs.filter((pair) => !!pair) as Pair[],
          })
          setIsLoading(false)
        }
      }

      fetchTokensInfo().then(() => fetchPairs())
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }, [
    currentNetworkName,
    getTokenInfo,
    isLoading,
    loadPairs,
    loadTokensInfo,
    networkName,
    result,
  ])

  return { ...result, isLoading, getTokenInfo }
}

export default usePairs

export const useTokenInfos = () => {
  const { isLoading: isPairsLoading } = usePairs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const res = useMemo(() => new Map(tokenInfos), [isPairsLoading])
  return res
}

export const useLpTokenInfos = () => {
  const { isLoading: isPairsLoading } = usePairs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const res = useMemo(() => new Map(lpTokenInfos), [isPairsLoading])
  return res
}

export function isAssetInfo(object: any): object is AssetInfo {
  return "token" in object
}

export function isNativeInfo(object: any): object is NativeInfo {
  return "native_token" in object
}
