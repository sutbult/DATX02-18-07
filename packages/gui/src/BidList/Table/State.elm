module BidList.Table.State exposing (..)

import BidList.Table.Types exposing (..)

init : Bool -> (Model, Cmd Msg)
init showStatus =
    (   { bids = []
        , showStatus = showStatus
        , filter =
            { from = []
            , to = []
            }
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

        SetFilter filter ->
            ({model | filter = filter}, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none
