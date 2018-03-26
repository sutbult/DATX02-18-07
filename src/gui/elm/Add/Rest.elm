module Add.Rest exposing (..)

import Add.Types exposing (..)
import Bid.Types exposing
    ( Bid
    , Value
    )
import Bid.Rest exposing
    ( encodeBid
    )

import Http
import Json.Decode


getCurrencies : Cmd Msg
getCurrencies =
    let
        request = Http.get "http://localhost:51337/api/getCurrencies" decodeCurrencies
        onResponse request =
            case request of
                Ok currencies ->
                    SetCurrencies currencies

                Err _ ->
                    SetCurrencies []
    in
        Http.send onResponse request


addBid : Bid -> Cmd Msg
addBid bid =
    let
        body = Http.jsonBody <| encodeBid bid
        request = Http.post "http://localhost:51337/api/addBid" body (Json.Decode.succeed ())
        onResponse result =
            case Debug.log "Result" result of
                Ok _ ->
                    SubmitSuccess

                Err _ ->
                    SubmitFailure
    in
        Http.send onResponse request


decodeCurrencies : Json.Decode.Decoder (List String)
decodeCurrencies = Json.Decode.list Json.Decode.string
