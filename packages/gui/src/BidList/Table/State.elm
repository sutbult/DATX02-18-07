module BidList.Table.State exposing (..)

import BidList.Table.Types exposing (..)

init : (Model, Cmd Msg)
init =
    (   { bids = []
        }
    , Cmd.none
    )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetBids bids ->
            ({model | bids = bids}, Cmd.none)

        Click _ ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none
