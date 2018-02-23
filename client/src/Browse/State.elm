module Browse.State exposing (init, update, subscriptions)

import Browse.Types exposing (..)

import Browse.Bids.Types exposing (Value, Bid)

import Browse.Bids.State as BidsState
import Browse.Filter.State as FilterState

import Platform.Cmd

init : Model
init =
    { bids = BidsState.init
        [ Bid (Value "Bitcoin" 0.01) (Value "Ethereum" 0.1)
        , Bid (Value "Ethereum" 0.5) (Value "Monero" 5)
        ]
    , filter = FilterState.init ["Bitcoin", "Ethereum"]
    }

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Filter subMsg ->
            let
                (subModel, subCmd) = FilterState.update subMsg (.filter model)
            in
                ({model | filter = subModel}, Platform.Cmd.map Filter subCmd)

        Bids subMsg ->
            let
                (subModel, subCmd) = BidsState.update subMsg (.bids model)
            in
                ({model | bids = subModel}, Platform.Cmd.map Bids subCmd)

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none
