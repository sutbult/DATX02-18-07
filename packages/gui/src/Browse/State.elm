module Browse.State exposing (init, update, subscriptions)

import Platform.Cmd

import Browse.Types exposing (..)
import Browse.Accept.State as AcceptState
import BidList.State as BidListState


init : (Model, Cmd Msg)
init =
    let
        (bidListModel, bidListCmd) = BidListState.init False "getBids"
        (acceptModel, acceptCmd) = AcceptState.init
    in
        (   { bidList = bidListModel
            , accept = acceptModel
            }
        , Cmd.batch
            [ Platform.Cmd.map mapBidListCmd bidListCmd
            , Platform.Cmd.map mapAcceptCmd acceptCmd
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ToBidList subMsg ->
            let
                (subModel, subCmd) = BidListState.update subMsg (.bidList model)
            in
                ({model | bidList = subModel}, Platform.Cmd.map mapBidListCmd subCmd)

        ToAccept subMsg ->
            let
                (subModel, subCmd) = AcceptState.update subMsg (.accept model)
            in
                ({model | accept = subModel}, Platform.Cmd.map mapAcceptCmd subCmd)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map mapBidListCmd <| BidListState.subscriptions model.bidList
        , Sub.map mapAcceptCmd <| AcceptState.subscriptions model.accept
        ]
