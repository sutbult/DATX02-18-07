module Browse.State exposing (init, update, subscriptions)

import Platform.Cmd

import Browse.Types exposing (..)
import Browse.Accept.State as AcceptState
import BidList.State as BidListState


init : (Model, Cmd Msg)
init =
    let
        (bidListModel, bidListCmd) = BidListState.init "getBids"
        (acceptModel, acceptCmd) = AcceptState.init
    in
        (   { bidList = bidListModel
            , accept = acceptModel
            }
        , Cmd.batch
            [ Platform.Cmd.map mapBidListCmd bidListCmd
            , Platform.Cmd.map ToAccept acceptCmd
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
                ({model | accept = subModel}, Platform.Cmd.map ToAccept subCmd)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map ToBidList <| BidListState.subscriptions model.bidList
        , Sub.map ToAccept <| AcceptState.subscriptions model.accept
        ]
