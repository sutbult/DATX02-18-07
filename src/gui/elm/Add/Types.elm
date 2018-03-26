module Add.Types exposing (..)

import Regex exposing (..)
import Maybe exposing (..)


import Bid.Types exposing
    ( Bid
    , createBid
    )


type alias Model =
    { fromCurrency : String
    , fromAmount : String
    , toCurrency : String
    , toAmount : String
    , submitting : Bool
    , currencies : List String
    }


type Msg
    = SetFromCurrency String
    | SetFromAmount String
    | SetToCurrency String
    | SetToAmount String
    | Submit
    | SubmitSuccess
    | SubmitFailure
    | SetCurrencies (List String)


type AmountStatus
    = None
    | Error
    | Success String String


getBid : Model -> Maybe Bid
getBid model =
    case
        ( amountStatus model.fromCurrency model.fromAmount
        , amountStatus model.toCurrency model.toAmount
        ) of
            (Success fromAmount _, Success toAmount _) ->
                Maybe.map4 (createBid "0" Bid.Types.Active)
                    (Just model.fromCurrency)
                    (Result.toMaybe <| String.toFloat fromAmount)
                    (Just model.toCurrency)
                    (Result.toMaybe <| String.toFloat toAmount)
            _ ->
                Nothing


amountStatus : String -> String -> AmountStatus
amountStatus currency amount =
    if String.isEmpty amount then
        None
    else if String.isEmpty currency then
        Error
    else
        case amountRegexMatch amount of
            Just (base, dec) ->
                let
                    (padding, unit) = baseUnit currency
                    value =
                        removeInitialZeroes <| String.concat
                            [ padZeroes False 1 <| base
                            , padZeroes True padding <| dec
                            ]
                in
                    Success value unit
            Nothing ->
                Error


-- TODO: Fixa så att dessa funktioner inte är publika

amountRegex : Regex
amountRegex = regex "^(\\d*)(?:\\.(\\d*)){0,1}$"


zeroRegex : Regex
zeroRegex = regex "^0*$"


amountRegexMatch : String -> Maybe (String, String)
amountRegexMatch amount =
    if contains amountRegex amount then
        case find All amountRegex amount of
            res::[] ->
                case res.submatches of
                    mbase::mdec::[] ->
                        let
                            base = withDefault "" mbase
                            dec = withDefault "" mdec
                        in
                            if not <| contains zeroRegex (base ++ dec) then
                                Just (base, dec)
                            else
                                Nothing
                    _ ->
                        Nothing
            _ ->
                Nothing
    else
        Nothing


padZeroes : Bool -> Int -> String -> String
padZeroes limit n str =
    if limit then
        String.left n <| padZeroes False n str
    else
        str ++ String.repeat (n - String.length str) "0"


-- TODO: Implementera med reguljära uttryck istället
removeInitialZeroes : String -> String
removeInitialZeroes str =
    if String.startsWith "0" str then
        removeInitialZeroes (String.dropLeft 1 str)
    else
        str


baseUnit : String -> (Int, String)
baseUnit currency =
    case currency of
        "Bitcoin" ->
            (8, "satoshi")

        "Ethereum" ->
            (18, "wei")

        _ ->
            (0, String.toLower currency)
