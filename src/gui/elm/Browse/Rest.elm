module Browse.Rest exposing (getBids)

import Http

import Browse.Types exposing (..)
import Json.Decode exposing (..)

import Bid.Types exposing
    ( Bid
    , Value
    )
import Bid.Rest exposing
    ( decodeBid
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
        Http.send onResponse request

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
decodeBids = list decodeBid
