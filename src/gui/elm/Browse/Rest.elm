module Browse.Rest exposing (getBids)

import Http

import Browse.Types exposing (..)
import Json.Decode exposing (..)

import Browse.Bids.Types exposing
    ( Bid
    , Value
    )

getBids : Cmd Msg
getBids =
    let
        request = Http.get "http://localhost:51337/api/getBids" decodeBids
        onResponse result =
            case Debug.log "Foo" result of
                Ok bids ->
                    SetBids bids

                Err error ->
                    SetBids []
    in
        Debug.log "Bajs" <| Http.send onResponse request

decodeBids : Decoder (List Bid)
decodeBids =
    let
        decodeValue = map2 Value
            (field "currency" string)
            (field "amount" float)
    in
        list <|
            map2 Bid
                (field "from" decodeValue)
                (field "to" decodeValue)
