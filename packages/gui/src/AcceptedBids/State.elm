module AcceptedBids.State exposing (..)

import Platform.Cmd

import BidList.State as BidListState
import AcceptedBids.Types exposing (..)


init : (Model, Cmd Msg)
init =
    let
        (bidListModel, bidListCmd) = BidListState.init "getAcceptedBids"
    in
        (   { bidList = bidListModel
            }
        , Cmd.batch
            [ Platform.Cmd.map ToBidList bidListCmd
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ToBidList subMsg ->
            let
                (subModel, subCmd) = BidListState.update subMsg (.bidList model)
            in
                ({model | bidList = subModel}, Platform.Cmd.map ToBidList subCmd)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map ToBidList
            <| BidListState.subscriptions model.bidList
        ]
