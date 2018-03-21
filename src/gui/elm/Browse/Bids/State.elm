module Browse.Bids.State exposing
    ( init
    , update
    , subscriptions
    )

import Browse.Bids.Types exposing (..)
import Bid.Types exposing (Bid)

init : List Bid -> (Model, Cmd Msg)
init bids = (
    { bids = bids
    , modal = Nothing
    }, Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetBids bids ->
            ({model | bids = bids}, Cmd.none)

        DisplayModal bid ->
            ({model | modal = Just bid}, Cmd.none)

        CancelModal ->
            ({model | modal = Nothing}, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
