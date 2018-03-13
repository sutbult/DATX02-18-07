module Browse.Bids.State exposing
    ( init
    , update
    , subscriptions
    )

import Browse.Bids.Types exposing (..)

init : List Bid -> (Model, Cmd Msg)
init bids = (Model bids, Cmd.none)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetBids bids ->
            ({model | bids = bids}, Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
