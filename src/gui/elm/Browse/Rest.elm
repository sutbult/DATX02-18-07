module Browse.Rest exposing (getBids)

import Http

import Browse.Types exposing (..)
import Json.Decode exposing (..)

import Browse.Bids.Types exposing
    ( Bid
    , Value
    )

import Error.Types

getBids : Cmd Msg
getBids =
    let
        request = Http.get "http://localhost:51337/api/getBids" decodeBids
        onResponse result =
            case Debug.log "Foo" result of
                Ok bids ->
                    SetBids bids

                Err error ->
                    Error <| Error.Types.Display "Connection error" <| errorMessage error
    in
        Debug.log "Bajs" <| Http.send onResponse request

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

decodeBids : Decoder (List Bid)
decodeBids =
    let
        decodeValue = map2 Value
            (field "currency" string)
            (field "amount" float)
    in
        list <|
            map3 Bid
                (field "id" string)
                (field "from" decodeValue)
                (field "to" decodeValue)
