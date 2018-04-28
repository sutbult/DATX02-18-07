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
        , page = 1
        , bidsPerPage = 20
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
            let
                newModel = {model
                    | filter = filter
                    , page = 1
                    }
            in
                (newModel, Cmd.none)

        SetPage page ->
            ({model | page = page}, Cmd.none)

        SetBidsPerPage bidsPerPage ->
            let
                newModel = {model
                    | bidsPerPage = bidsPerPage
                    , page = 1
                    }
            in
                (newModel, Cmd.none)

        Noop ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none
