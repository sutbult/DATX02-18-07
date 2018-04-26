module UserBids.State exposing (..)

import Platform.Cmd

import BidList.NotifiedState as BidListState
import UserBids.Types exposing (..)


init : (Model, Cmd Msg)
init =
    let
        (bidListModel, bidListCmd) = BidListState.init True "getUserBids"
    in
        (   { bidList = bidListModel
            }
        , Cmd.batch
            [ Platform.Cmd.map mapBidList bidListCmd
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ToBidList subMsg ->
            let
                (subModel, subCmd) = BidListState.update subMsg (.bidList model)
            in
                ({model | bidList = subModel}, Platform.Cmd.map mapBidList subCmd)

        TriggerPassword _ _ _ _ ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map mapBidList
            <| BidListState.subscriptions model.bidList
        ]
