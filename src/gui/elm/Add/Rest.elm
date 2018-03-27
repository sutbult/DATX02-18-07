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
import Error.Types


getCurrencies : Cmd Msg
getCurrencies =
    let
        request = Http.get "http://localhost:51337/api/getCurrencies" decodeCurrencies
        onResponse request =
            case request of
                Ok currencies ->
                    SetCurrencies currencies

                Err error ->
                    ToError <| Error.Types.Display "Connection error" <| errorMessage error
    in
        Http.send onResponse request


-- Kopia från Browse.Rest
errorMessage : Http.Error -> String
errorMessage error =
    case error of
        Http.BadUrl url ->
            "The given URL ''" ++ url ++ "'' is incorrect."

        Http.NetworkError ->
            "The client cannot connect to the blockchain server."

        Http.Timeout ->
            "The request timed out."

        Http.BadStatus response ->
            "The server responded with the status " ++ toString response.status.code ++ "."

        Http.BadPayload descr _ ->
            "The response is incorrectly formatted. See '" ++ descr ++ "'"


addBid : Bid -> Cmd Msg
addBid bid =
    let
        body = Http.jsonBody <| encodeBid bid
        request = Http.post "http://localhost:51337/api/addBid" body (Json.Decode.succeed ())
        onResponse result =
            case Debug.log "Result" result of
                Ok _ ->
                    SubmitSuccess

                Err error ->
                    SubmitFailure <| Error.Types.Display "Connection error" <| errorMessage error
    in
        Http.send onResponse request


decodeCurrencies : Json.Decode.Decoder (List String)
decodeCurrencies = Json.Decode.list Json.Decode.string
